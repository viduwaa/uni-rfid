"use client";

import {
    useEffect,
    useState,
    useImperativeHandle,
    forwardRef,
    useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CreditCard,
    Radio,
    Zap,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    User,
    Wallet,
    ShoppingCart,
} from "lucide-react";

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

interface StudentData {
    user_id: string;
    register_number: string;
    full_name: string;
    email: string;
    faculty: string;
    card_uid: string;
    balance: number;
    card_status: string;
}

interface CartItem {
    menu_item_id: string;
    quantity: number;
    name: string;
    price: number;
}

interface RFIDOrderProcessorProps {
    cart: CartItem[];
    onTransactionComplete: (success: boolean, data?: any) => void;
    onInsufficientBalance?: (totalAmount: number, balance: number) => void;
    autoStart?: boolean; // Auto-start waiting for card when component mounts
}

export interface RFIDOrderProcessorRef {
    startReading: () => void;
    processManualPayment: (amount?: number) => Promise<void>;
    clearData: () => void;
}

const RFIDOrderProcessor = forwardRef<
    RFIDOrderProcessorRef,
    RFIDOrderProcessorProps
>(
    (
        {
            cart,
            onTransactionComplete,
            onInsufficientBalance,
            autoStart = false,
        },
        ref
    ) => {
        const [socket, setSocket] = useState<Socket | null>(null);
        const [nfcStatus, setNfcStatus] = useState({
            status: "disconnected",
            reader: null,
            error: null,
        });

        const [studentData, setStudentData] = useState<StudentData | null>(
            null
        );
        const [isProcessing, setIsProcessing] = useState(false);
        const [eventLog, setEventLog] = useState<string[]>([]);
        const [waitingForCard, setWaitingForCard] = useState(false);
        const [transactionStatus, setTransactionStatus] = useState<
            | "idle"
            | "waiting"
            | "detected"
            | "processing"
            | "success"
            | "failed"
        >("idle");

        // Use ref to track current cart to avoid stale closure in socket callbacks
        const cartRef = useRef<CartItem[]>(cart);

        // Update cart ref whenever cart changes
        useEffect(() => {
            cartRef.current = cart;
            console.log("Cart ref updated:", cart);
        }, [cart]);

        // Initialize socket connection
        useEffect(() => {
            const socketConnection = io(SOCKET_SERVER_URL);
            setSocket(socketConnection);

            socketConnection.on("connect", () => {
                console.log("🔌 Connected to NFC server");
                addLog("🔌 Connected to NFC server");
                socketConnection.emit("get-nfc-status");
            });

            socketConnection.on("nfc-reader-status", (status) => {
                console.log("📶 NFC Status:", status);
                setNfcStatus(status);
                if (status.status === "connected") {
                    addLog(`📶 NFC Reader: ${status.reader || "Ready"}`);
                } else if (status.status === "error") {
                    addLog(`❌ Reader error: ${status.error}`);
                }
            });

            socketConnection.on("nfc-swipe", async (cardData) => {
                console.log("💳 Card detected:", cardData.uid);
                addLog(`💳 Card swiped: ${cardData.uid}`);
                setTransactionStatus("detected");
                await fetchStudentByCardUID(cardData.uid);
            });

            socketConnection.on("nfc-swipe-end", () => {
                console.log("📤 Card removed");
                addLog("📤 Card removed");
                if (transactionStatus === "waiting") {
                    setWaitingForCard(false);
                }
            });

            socketConnection.on("disconnect", () => {
                console.log("❌ Disconnected from NFC server");
                addLog("❌ Disconnected from NFC server");
            });

            return () => {
                socketConnection.disconnect();
            };
        }, []);

        // Auto-start if enabled and cart has items
        useEffect(() => {
            if (
                autoStart &&
                nfcStatus.status === "connected" &&
                cart.length > 0
            ) {
                console.log("Auto-starting with cart:", cart);
                startReading();
            }
        }, [autoStart, nfcStatus.status, cart.length]);

        const addLog = (message: string) => {
            setEventLog((prev) => [...prev.slice(-20), message]); // Keep last 20 logs
        };

        // Fetch student data from database using card UID
        const fetchStudentByCardUID = async (cardUID: string) => {
            setIsProcessing(true);
            addLog(`🔍 Looking up card: ${cardUID}`);

            try {
                const response = await fetch(
                    `/api/rfid/cards?card_uid=${cardUID}`
                );
                const result = await response.json();

                if (result.success && result.data && result.data.length > 0) {
                    const card = result.data[0];

                    if (card.status !== "ACTIVE") {
                        addLog(`❌ Card is ${card.status} - cannot process`);
                        setTransactionStatus("failed");
                        onTransactionComplete(false, {
                            error: `Card is ${card.status}`,
                        });
                        setTimeout(() => {
                            resetToWaiting();
                        }, 3000);
                        return;
                    }

                    // Fetch full student details
                    const studentResponse = await fetch(
                        `/api/students?register_number=${card.register_number}`
                    );
                    const studentResult = await studentResponse.json();

                    if (studentResult.success && studentResult.data) {
                        setStudentData(studentResult.data);
                        addLog(
                            `✅ Student found: ${studentResult.data.full_name}`
                        );
                        addLog(`💰 Balance: Rs. ${studentResult.data.balance}`);

                        // Auto-process payment
                        await processTransaction(studentResult.data);
                    } else {
                        addLog(`❌ Student not found`);
                        setTransactionStatus("failed");
                        onTransactionComplete(false, {
                            error: "Student not found",
                        });
                        setTimeout(() => {
                            resetToWaiting();
                        }, 3000);
                    }
                } else {
                    addLog(`❌ Card not found or not issued`);
                    setTransactionStatus("failed");
                    onTransactionComplete(false, {
                        error: "Card not found",
                    });
                    setTimeout(() => {
                        resetToWaiting();
                    }, 3000);
                }
            } catch (error) {
                console.error("Card lookup error:", error);
                addLog(`❌ Lookup failed: ${(error as Error).message}`);
                setTransactionStatus("failed");
                onTransactionComplete(false, { error: "Lookup failed" });
                setTimeout(() => {
                    resetToWaiting();
                }, 3000);
            } finally {
                setIsProcessing(false);
            }
        };

        // Process transaction
        const processTransaction = async (student: StudentData) => {
            // Use cartRef.current to get the latest cart value
            const currentCart = cartRef.current;

            // Log cart status for debugging
            console.log("Processing transaction with cart:", currentCart);
            addLog(`📦 Cart items: ${currentCart.length}`);

            if (!currentCart.length) {
                addLog("❌ No items in cart");
                setTransactionStatus("failed");
                onTransactionComplete(false, {
                    error: "No items in cart",
                });
                setTimeout(() => {
                    resetToWaiting();
                }, 3000);
                return;
            }

            setTransactionStatus("processing");
            setIsProcessing(true);
            addLog("💳 Processing payment...");

            try {
                const totalAmount = currentCart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );

                addLog(`💵 Total amount: Rs. ${totalAmount}`);

                // Check if student has sufficient balance
                if (student.balance < totalAmount) {
                    addLog(
                        `❌ Insufficient balance. Need: Rs. ${totalAmount}, Available: Rs. ${student.balance}`
                    );
                    setTransactionStatus("failed");

                    if (onInsufficientBalance) {
                        onInsufficientBalance(totalAmount, student.balance);
                    } else {
                        onTransactionComplete(false, {
                            error: "Insufficient balance",
                            totalAmount,
                            balance: student.balance,
                        });
                    }

                    setTimeout(() => {
                        resetToWaiting();
                    }, 3000);
                    return;
                }

                // Prepare transaction data
                const transactionData = {
                    student_id: student.user_id,
                    card_uid: student.card_uid,
                    items: currentCart.map((item) => ({
                        menu_item_id: item.menu_item_id,
                        quantity: item.quantity,
                    })),
                };

                addLog(`📤 Sending transaction...`);

                // Create transaction
                const response = await fetch("/api/canteen/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(transactionData),
                });

                const result = await response.json();

                if (result.success) {
                    setTransactionStatus("success");
                    addLog(
                        `✅ Payment successful! Transaction ID: ${result.data.transaction_id}`
                    );
                    addLog(
                        `💰 New balance: Rs. ${student.balance - totalAmount}`
                    );

                    onTransactionComplete(true, result.data);

                    // Auto-reset after success
                    setTimeout(() => {
                        resetToWaiting();
                    }, 3000);
                } else {
                    setTransactionStatus("failed");
                    addLog(`❌ Transaction failed: ${result.message}`);
                    onTransactionComplete(false, {
                        error: result.message,
                    });

                    setTimeout(() => {
                        resetToWaiting();
                    }, 3000);
                }
            } catch (error) {
                console.error("Transaction error:", error);
                setTransactionStatus("failed");
                addLog(`❌ Transaction error: ${(error as Error).message}`);
                onTransactionComplete(false, { error: "Transaction failed" });

                setTimeout(() => {
                    resetToWaiting();
                }, 3000);
            } finally {
                setIsProcessing(false);
            }
        };

        // Process manual payment
        const processManualPayment = async (manualAmount?: number) => {
            const currentCart = cartRef.current;

            if (!studentData || !currentCart.length) return;

            setIsProcessing(true);
            setTransactionStatus("processing");
            addLog("💵 Processing manual payment...");

            try {
                const totalAmount = currentCart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );

                const transactionData = {
                    student_id: studentData.user_id,
                    card_uid: studentData.card_uid,
                    items: currentCart.map((item) => ({
                        menu_item_id: item.menu_item_id,
                        quantity: item.quantity,
                    })),
                    payment_method: "manual" as const,
                    manual_payment_amount: manualAmount || totalAmount,
                };

                addLog(`📤 Manual payment: Rs. ${manualAmount || totalAmount}`);

                const response = await fetch("/api/canteen/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(transactionData),
                });

                const result = await response.json();

                if (result.success) {
                    setTransactionStatus("success");
                    addLog(
                        `✅ Manual payment successful! Transaction ID: ${result.data.transaction_id}`
                    );
                    onTransactionComplete(true, result.data);

                    setTimeout(() => {
                        resetToWaiting();
                    }, 3000);
                } else {
                    setTransactionStatus("failed");
                    addLog(`❌ Manual payment failed: ${result.message}`);
                    onTransactionComplete(false, { error: result.message });

                    setTimeout(() => {
                        resetToWaiting();
                    }, 3000);
                }
            } catch (error) {
                console.error("Manual payment error:", error);
                setTransactionStatus("failed");
                addLog(`❌ Manual payment error: ${(error as Error).message}`);
                onTransactionComplete(false, {
                    error: "Manual payment failed",
                });

                setTimeout(() => {
                    resetToWaiting();
                }, 3000);
            } finally {
                setIsProcessing(false);
            }
        };

        // Start reading
        const startReading = () => {
            setWaitingForCard(true);
            setTransactionStatus("waiting");
            addLog("⏳ Waiting for card tap...");
        };

        // Clear all data
        const clearData = () => {
            setStudentData(null);
            setEventLog([]);
            setWaitingForCard(false);
            setTransactionStatus("idle");
        };

        // Reset to waiting state
        const resetToWaiting = () => {
            setStudentData(null);
            setWaitingForCard(true);
            setTransactionStatus("waiting");
            addLog("⏳ Ready for next order...");
        };

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            startReading,
            processManualPayment,
            clearData,
        }));

        const calculateTotal = () => {
            return cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        };

        const getStatusColor = () => {
            switch (transactionStatus) {
                case "waiting":
                    return "border-blue-500 bg-blue-50 dark:bg-blue-950";
                case "detected":
                    return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
                case "processing":
                    return "border-orange-500 bg-orange-50 dark:bg-orange-950";
                case "success":
                    return "border-green-500 bg-green-50 dark:bg-green-950";
                case "failed":
                    return "border-red-500 bg-red-50 dark:bg-red-950";
                default:
                    return "border-gray-200 bg-white dark:bg-gray-800";
            }
        };

        const getStatusIcon = () => {
            switch (transactionStatus) {
                case "waiting":
                    return (
                        <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                    );
                case "detected":
                    return <Zap className="h-6 w-6 text-yellow-600" />;
                case "processing":
                    return (
                        <RefreshCw className="h-6 w-6 text-orange-600 animate-spin" />
                    );
                case "success":
                    return <CheckCircle className="h-6 w-6 text-green-600" />;
                case "failed":
                    return <AlertCircle className="h-6 w-6 text-red-600" />;
                default:
                    return <CreditCard className="h-6 w-6 text-gray-400" />;
            }
        };

        const getStatusMessage = () => {
            switch (transactionStatus) {
                case "waiting":
                    return "Tap your NFC card to pay";
                case "detected":
                    return "Card detected! Reading...";
                case "processing":
                    return "Processing payment...";
                case "success":
                    return "Payment successful!";
                case "failed":
                    return "Payment failed";
                default:
                    return cart.length > 0
                        ? "Ready to process order"
                        : "Add items to cart";
            }
        };

        return (
            <Card
                className={`w-full transition-all border-2 ${getStatusColor()}`}
            >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getStatusIcon()}
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    NFC Payment Terminal
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {getStatusMessage()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    nfcStatus.status === "connected"
                                        ? "default"
                                        : "destructive"
                                }
                                className="flex items-center gap-1"
                            >
                                <Radio
                                    className={`h-3 w-3 ${
                                        nfcStatus.status === "connected"
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                />
                                {nfcStatus.status === "connected"
                                    ? "NFC Ready"
                                    : "NFC Offline"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Cart Summary */}
                    {cart.length > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                                <h3 className="font-semibold">
                                    Order Summary ({cart.length} items)
                                </h3>
                            </div>
                            <div className="space-y-1 text-sm max-h-32 overflow-y-auto mb-3">
                                {cart.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between py-1"
                                    >
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            Rs. {item.price * item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total:</span>
                                <span className="text-green-600">
                                    Rs. {calculateTotal()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Student Information */}
                    {studentData && (
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="h-5 w-5 text-green-600" />
                                <h3 className="font-semibold text-green-800 dark:text-green-200">
                                    Customer Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Name:
                                    </span>
                                    <p className="font-semibold">
                                        {studentData.full_name}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Register No:
                                    </span>
                                    <p className="font-semibold">
                                        {studentData.register_number}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Faculty:
                                    </span>
                                    <p className="font-semibold uppercase">
                                        {studentData.faculty}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Balance:
                                    </span>
                                    <p
                                        className={`font-bold text-lg flex items-center gap-1 ${
                                            studentData.balance > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        <Wallet className="h-4 w-4" />
                                        Rs. {studentData.balance}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex gap-2">
                        {!waitingForCard && transactionStatus === "idle" && (
                            <Button
                                onClick={startReading}
                                disabled={
                                    nfcStatus.status !== "connected" ||
                                    cart.length === 0
                                }
                                className="flex-1"
                                size="lg"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Start Payment Process
                            </Button>
                        )}

                        {(waitingForCard || transactionStatus !== "idle") &&
                            transactionStatus !== "success" && (
                                <Button
                                    onClick={clearData}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                            )}
                    </div>

                    {/* Event Log */}
                    <div className="bg-gray-900 text-gray-100 p-3 rounded border font-mono text-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                                📋 Activity Log
                            </span>
                            {eventLog.length > 0 && (
                                <button
                                    onClick={() => setEventLog([])}
                                    className="text-gray-400 hover:text-gray-200 text-xs"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {eventLog.length === 0 ? (
                                <p className="text-gray-500">
                                    No activity yet...
                                </p>
                            ) : (
                                eventLog.map((log, index) => (
                                    <div key={index} className="text-gray-300">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
);

RFIDOrderProcessor.displayName = "RFIDOrderProcessor";

export default RFIDOrderProcessor;
