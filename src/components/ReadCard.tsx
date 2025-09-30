"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from "lucide-react";

interface NFCCardData {
    register_number: string;
    name: string;
    faculty_name: string;
}

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

interface ReadCardProps {
    cart: CartItem[];
    onTransactionComplete: (success: boolean, message: string) => void;
    onStudentDataReceived: (student: StudentData | null) => void;
    autoProcessPayment?: boolean; // New prop for auto-payment
    onInsufficientBalance?: (totalAmount: number, balance: number) => void; // New prop for insufficient balance handling
}

export interface ReadCardRef {
    processManualPayment: (amount?: number) => Promise<void>;
}

const ReadCard = forwardRef<ReadCardRef, ReadCardProps>(
    (
        {
            cart,
            onTransactionComplete,
            onStudentDataReceived,
            autoProcessPayment = false,
            onInsufficientBalance,
        },
        ref
    ) => {
        const [socket, setSocket] = useState<Socket | null>(null);
        const [nfcStatus, setNfcStatus] = useState({
            status: "disconnected",
            reader: null,
            error: null,
        });

        const [cardData, setCardData] = useState<NFCCardData | null>(null);
        const [studentData, setStudentData] = useState<StudentData | null>(
            null
        );
        const [isProcessing, setIsProcessing] = useState(false);
        const [eventLog, setEventLog] = useState<string[]>([]);
        const [waitingForCard, setWaitingForCard] = useState(false);

        // Initialize socket connection
        useEffect(() => {
            const socketConnection = io("http://localhost:4000");
            setSocket(socketConnection);

            socketConnection.on("connect", () => {
                console.log("✅ Connected to NFC socket server");
                setEventLog((prev) => [...prev, "🔌 Connected to NFC reader"]);
                socketConnection.emit("get-nfc-status");
            });

            socketConnection.on("nfc-reader-status", (status) => {
                console.log("📡 NFC Reader status:", status);
                setNfcStatus(status);

                if (status.status === "connected") {
                    setEventLog((prev) => [
                        ...prev,
                        `📲 Reader connected: ${status.reader}`,
                    ]);
                } else if (status.status === "error") {
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Reader error: ${status.error}`,
                    ]);
                }
            });

            socketConnection.on("nfc-swipe", async (data) => {
                console.log("💳 Card swiped:", data);
                setEventLog((prev) => [
                    ...prev,
                    `💳 Card detected: ${data.uid}`,
                ]);

                if (data.data && data.data.register_number) {
                    setCardData(data.data);
                    setEventLog((prev) => [
                        ...prev,
                        `📖 Card data read: ${data.data.name} (${data.data.register_number})`,
                    ]);

                    // Fetch student data from database
                    await fetchStudentData(data.data.register_number);
                } else {
                    setEventLog((prev) => [
                        ...prev,
                        "❌ No valid data found on card",
                    ]);
                }
            });

            socketConnection.on("nfc-swipe-end", (data) => {
                console.log("👋 Card removed:", data);
                setEventLog((prev) => [
                    ...prev,
                    `👋 Card removed: ${data.uid}`,
                ]);
                setWaitingForCard(false);
            });

            return () => {
                socketConnection.disconnect();
            };
        }, []);

        // Fetch student data from database using register number
        const fetchStudentData = async (registerNumber: string) => {
            setIsProcessing(true);
            setEventLog((prev) => [
                ...prev,
                `🔍 Looking up student: ${registerNumber}`,
            ]);

            try {
                const response = await fetch(
                    `/api/students?register_number=${registerNumber}`
                );
                const result = await response.json();

                if (result.success && result.data) {
                    setStudentData(result.data);
                    onStudentDataReceived(result.data);
                    setEventLog((prev) => [
                        ...prev,
                        `✅ Student found: ${result.data.full_name}`,
                    ]);
                    setEventLog((prev) => [
                        ...prev,
                        `💰 Balance: Rs.${result.data.balance}`,
                    ]);

                    // Auto-process payment if enabled and cart has items
                    if (autoProcessPayment && cart.length > 0) {
                        setEventLog((prev) => [
                            ...prev,
                            `🚀 Auto-processing payment...`,
                        ]);
                        // Small delay to show the student info briefly
                        setTimeout(() => {
                            processTransaction();
                        }, 1000);
                    }
                } else {
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Student not found: ${registerNumber}`,
                    ]);
                    setStudentData(null);
                    onStudentDataReceived(null);
                }
            } catch (error) {
                console.error("Error fetching student data:", error);
                setEventLog((prev) => [
                    ...prev,
                    `❌ Database error: ${(error as Error).message}`,
                ]);
                setStudentData(null);
                onStudentDataReceived(null);
            } finally {
                setIsProcessing(false);
            }
        };

        // Process transaction
        const processTransaction = async () => {
            if (!studentData || !cart.length) return;

            setIsProcessing(true);
            setEventLog((prev) => [...prev, "💳 Processing payment..."]);

            try {
                // Calculate total
                const totalAmount = cart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );

                // Check if student has sufficient balance
                if (studentData.balance < totalAmount) {
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Insufficient balance. Need: Rs.${totalAmount}, Available: Rs.${studentData.balance}`,
                    ]);

                    // Call the callback for insufficient balance handling
                    if (onInsufficientBalance) {
                        onInsufficientBalance(totalAmount, studentData.balance);
                    } else {
                        onTransactionComplete(false, "Insufficient balance");
                    }
                    return;
                }

                // Prepare transaction data
                const transactionData = {
                    student_id: studentData.user_id,
                    card_uid: studentData.card_uid,
                    items: cart.map((item) => ({
                        menu_item_id: item.menu_item_id,
                        quantity: item.quantity,
                    })),
                };

                console.log("Transaction data being sent:", transactionData);
                setEventLog((prev) => [
                    ...prev,
                    `🔍 Sending transaction: ${JSON.stringify(transactionData.items)}`,
                ]);

                // Create transaction
                const response = await fetch("/api/canteen/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(transactionData),
                });

                const result = await response.json();

                console.log("Transaction API response:", result);
                setEventLog((prev) => [
                    ...prev,
                    `📋 API Response: ${JSON.stringify(result)}`,
                ]);

                if (result.success) {
                    setEventLog((prev) => [
                        ...prev,
                        `✅ Payment successful! Transaction ID: ${result.data.transaction_id}`,
                    ]);
                    setEventLog((prev) => [
                        ...prev,
                        `💰 New balance: Rs.${studentData.balance - totalAmount}`,
                    ]);

                    // Update local student data
                    setStudentData((prev) =>
                        prev
                            ? { ...prev, balance: prev.balance - totalAmount }
                            : null
                    );

                    onTransactionComplete(
                        true,
                        `Transaction successful! ID: ${result.data.transaction_id}`
                    );
                } else {
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Transaction failed: ${result.message}`,
                    ]);
                    onTransactionComplete(false, result.message);
                }
            } catch (error) {
                console.error("Transaction error:", error);
                setEventLog((prev) => [
                    ...prev,
                    `❌ Transaction error: ${(error as Error).message}`,
                ]);
                onTransactionComplete(false, "Transaction failed");
            } finally {
                setIsProcessing(false);
            }
        };

        // Process manual payment
        const processManualPayment = async (manualAmount?: number) => {
            if (!studentData || !cart.length) return;

            setIsProcessing(true);
            setEventLog((prev) => [...prev, "💵 Processing manual payment..."]);

            try {
                const totalAmount = cart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );

                // Prepare transaction data for manual payment
                const transactionData = {
                    student_id: studentData.user_id,
                    card_uid: studentData.card_uid,
                    items: cart.map((item) => ({
                        menu_item_id: item.menu_item_id,
                        quantity: item.quantity,
                    })),
                    payment_method: "manual" as const,
                    manual_payment_amount: manualAmount || totalAmount,
                };

                console.log("Manual payment data being sent:", transactionData);
                setEventLog((prev) => [
                    ...prev,
                    `🔍 Sending manual payment: Rs.${manualAmount || totalAmount}`,
                ]);

                // Create transaction
                const response = await fetch("/api/canteen/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(transactionData),
                });

                const result = await response.json();

                console.log("Manual payment API response:", result);
                setEventLog((prev) => [
                    ...prev,
                    `📋 API Response: ${JSON.stringify(result)}`,
                ]);

                if (result.success) {
                    setEventLog((prev) => [
                        ...prev,
                        `✅ Manual payment successful! Transaction ID: ${result.data.transaction_id}`,
                    ]);

                    onTransactionComplete(
                        true,
                        `Manual payment successful! ID: ${result.data.transaction_id}`
                    );
                } else {
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Manual payment failed: ${result.message}`,
                    ]);
                    onTransactionComplete(false, result.message);
                }
            } catch (error) {
                console.error("Manual payment error:", error);
                setEventLog((prev) => [
                    ...prev,
                    `❌ Manual payment error: ${(error as Error).message}`,
                ]);
                onTransactionComplete(false, "Manual payment failed");
            } finally {
                setIsProcessing(false);
            }
        };

        // Clear all data
        const clearData = () => {
            setCardData(null);
            setStudentData(null);
            setEventLog([]);
            onStudentDataReceived(null);
        };

        // Start waiting for card
        const startReading = () => {
            setWaitingForCard(true);
            setEventLog((prev) => [...prev, "⏳ Waiting for card tap..."]);
        };

        // Expose the processManualPayment function via ref
        useImperativeHandle(ref, () => ({
            processManualPayment,
        }));

        const calculateTotal = () => {
            return cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        };

        const canProcessTransaction =
            studentData && cart.length > 0 && !isProcessing;
        const hasInsufficientFunds =
            studentData &&
            cart.length > 0 &&
            studentData.balance < calculateTotal();

        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        💳 NFC Card Reader
                        <Badge
                            variant={
                                nfcStatus.status === "connected"
                                    ? "default"
                                    : "destructive"
                            }
                        >
                            {nfcStatus.status}
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* NFC Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Reader: {nfcStatus.reader || "None"}
                        </span>

                        <div className="flex gap-2">
                            <Button
                                onClick={startReading}
                                disabled={
                                    nfcStatus.status !== "connected" ||
                                    waitingForCard
                                }
                                size="sm"
                            >
                                {waitingForCard
                                    ? "Waiting for Card..."
                                    : "Start Reading"}
                            </Button>

                            <Button
                                onClick={clearData}
                                variant="outline"
                                size="sm"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Student Information */}
                    {studentData && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-green-800 mb-2">
                                Student Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                    <strong>Name:</strong>{" "}
                                    {studentData.full_name}
                                </div>
                                <div>
                                    <strong>Register No:</strong>{" "}
                                    {studentData.register_number}
                                </div>
                                <div>
                                    <strong>Faculty:</strong>{" "}
                                    {studentData.faculty}
                                </div>
                                <div>
                                    <strong>Balance:</strong>
                                    <span
                                        className={`ml-1 font-semibold ${studentData.balance > 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        Rs.{studentData.balance}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart Summary */}
                    {cart.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-2">
                                Cart Summary ({cart.length} items)
                            </h3>
                            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                {cart.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span>
                                            Rs.
                                            {(
                                                item.price * item.quantity
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>Rs.{calculateTotal()}</span>
                            </div>
                        </div>
                    )}

                    {/* Transaction Buttons */}
                    {canProcessTransaction && (
                        <div className="flex flex-col gap-2">
                            {hasInsufficientFunds && (
                                <div className="bg-red-50 p-3 rounded border border-red-200">
                                    <p className="text-red-700 text-sm">
                                        ⚠️ Insufficient balance! Need Rs.
                                        {(
                                            calculateTotal() -
                                            studentData.balance
                                        ).toFixed(2)}{" "}
                                        more.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    onClick={processTransaction}
                                    disabled={
                                        isProcessing || !!hasInsufficientFunds
                                    }
                                    className="flex-1"
                                    size="lg"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    {isProcessing
                                        ? "Processing..."
                                        : `Pay Rs.${calculateTotal()}`}
                                </Button>

                                {hasInsufficientFunds && (
                                    <Button
                                        onClick={() =>
                                            onInsufficientBalance?.(
                                                calculateTotal(),
                                                studentData!.balance
                                            )
                                        }
                                        variant="outline"
                                        size="lg"
                                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                    >
                                        💵 Manual Payment
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Event Log */}
                    <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="font-semibold text-sm mb-2">
                            📋 Activity Log
                        </h4>
                        <div className="text-xs max-h-40 overflow-y-auto space-y-1">
                            {eventLog.length === 0 ? (
                                <p className="text-gray-500">
                                    No activity yet...
                                </p>
                            ) : (
                                eventLog.map((log, index) => (
                                    <div key={index} className="text-gray-700">
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

ReadCard.displayName = "ReadCard";

export default ReadCard;
