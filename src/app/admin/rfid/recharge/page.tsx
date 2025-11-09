"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Wallet,
    Search,
    CreditCard,
    DollarSign,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Radio,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import DeviceStatus from "@/components/DeviceStatus";
import { RFIDLogger } from "@/components/RFIDLogger";

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

interface IssuedCard {
    user_id: string;
    full_name: string;
    register_number: string;
    faculty: string;
    card_uid: string;
    balance: number;
    status: "ACTIVE" | "INACTIVE" | "BLOCKED";
    issued_at: string;
}

export default function RechargeCards() {
    const [cards, setCards] = useState<IssuedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCard, setSelectedCard] = useState<IssuedCard | null>(null);
    const [rechargeAmount, setRechargeAmount] = useState("");
    const [validationError, setValidationError] = useState("");
    const [isRecharging, setIsRecharging] = useState(false);

    // NFC Socket state
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState({
        status: "disconnected",
        reader: null,
    });
    const [waitingForCard, setWaitingForCard] = useState(false);
    const [eventLog, setEventLog] = useState<string[]>([]);

    // Filtered cards based on search query
    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return cards;

        const query = searchQuery.toLowerCase().trim();
        return cards.filter(
            (card) =>
                card.full_name?.toLowerCase().includes(query) ||
                card.register_number?.toLowerCase().includes(query) ||
                card.card_uid?.toLowerCase().includes(query)
        );
    }, [cards, searchQuery]);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/rfid/cards?issued=true");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch cards");
            }

            if (data.success) {
                // Only show ACTIVE cards for recharge
                const activeCards = data.data.filter(
                    (card: IssuedCard) => card.status === "ACTIVE"
                );
                setCards(activeCards);
                toast.success(`Found ${activeCards.length} active cards`);
            } else {
                throw new Error(data.message || "Failed to fetch cards");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching cards", {
                description: (error as Error).message,
            });
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    // Initialize NFC Socket.IO connection
    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);

        newSocket.on("connect", () => {
            console.log("🔌 Connected to NFC server");
            setEventLog((prev) => [...prev, "🔌 Connected to NFC server"]);
            newSocket.emit("get-nfc-status");
        });

        newSocket.on("nfc-reader-status", (status) => {
            console.log("📶 NFC Status:", status);
            setNfcStatus(status);
            setEventLog((prev) => [...prev, `📶 NFC Reader: ${status.status}`]);
        });

        newSocket.on("nfc-swipe", (cardData) => {
            console.log("💳 Card detected:", cardData.uid);
            setEventLog((prev) => [...prev, `💳 Card swiped: ${cardData.uid}`]);
            fetchCardByUID(cardData.uid);
        });

        newSocket.on("nfc-swipe-end", () => {
            console.log("📤 Card removed");
            setEventLog((prev) => [...prev, "📤 Card removed"]);
            setWaitingForCard(false);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Disconnected from NFC server");
            setEventLog((prev) => [...prev, "❌ Disconnected from NFC server"]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const fetchCardByUID = async (cardUID: string) => {
        setEventLog((prev) => [...prev, `🔍 Looking up card: ${cardUID}`]);

        try {
            // Find the card in the existing cards list
            const foundCard = cards.find((card) => card.card_uid === cardUID);

            if (foundCard) {
                handleCardSelect(foundCard);
                toast.success("Card recognized!", {
                    description: `${foundCard.full_name} - Rs. ${foundCard.balance}`,
                });
                setEventLog((prev) => [
                    ...prev,
                    `✅ Card found: ${foundCard.full_name}`,
                ]);
            } else {
                // Card not in list, fetch from API
                const response = await fetch(
                    `/api/rfid/cards?card_uid=${cardUID}`
                );
                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    const card = data.data[0];
                    if (card.status === "ACTIVE") {
                        handleCardSelect(card);
                        toast.success("Card recognized!", {
                            description: `${card.full_name} - Rs. ${card.balance}`,
                        });
                        setEventLog((prev) => [
                            ...prev,
                            `✅ Card found: ${card.full_name}`,
                        ]);
                    } else {
                        toast.error(
                            `Card is ${card.status} and cannot be recharged`
                        );
                        setEventLog((prev) => [
                            ...prev,
                            `❌ Card is ${card.status}`,
                        ]);
                    }
                } else {
                    toast.error("Card not found or not issued");
                    setEventLog((prev) => [...prev, `❌ Card not found`]);
                }
            }
        } catch (error) {
            console.error("Card lookup error:", error);
            toast.error("Failed to lookup card");
            setEventLog((prev) => [
                ...prev,
                `❌ Lookup failed: ${(error as Error).message}`,
            ]);
        }
    };

    const startNFCReading = () => {
        setWaitingForCard(true);
        setEventLog((prev) => [...prev, "⏳ Waiting for card swipe..."]);
        toast.info("Please swipe or tap the card on the reader");
    };

    const validateAmount = (amount: string): boolean => {
        setValidationError("");

        if (!amount || amount.trim() === "") {
            setValidationError("Please enter a recharge amount");
            return false;
        }

        const numAmount = parseFloat(amount);

        if (isNaN(numAmount)) {
            setValidationError("Amount must be a valid number");
            return false;
        }

        if (numAmount <= 0) {
            setValidationError("Amount must be greater than 0");
            return false;
        }

        if (numAmount > 10000) {
            setValidationError("Amount cannot exceed Rs. 10,000");
            return false;
        }

        return true;
    };

    const handleRecharge = async () => {
        if (!selectedCard) {
            toast.error("No card selected");
            return;
        }

        if (!validateAmount(rechargeAmount)) {
            return;
        }

        setIsRecharging(true);

        try {
            const amount = parseFloat(rechargeAmount);
            const response = await fetch("/api/rfid/recharge", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    card_uid: selectedCard.card_uid,
                    amount: amount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Recharge failed");
            }

            toast.success("Card recharged successfully!", {
                description: `Added Rs. ${amount} to ${selectedCard.full_name}'s card`,
            });

            // Reset form
            setRechargeAmount("");
            setSelectedCard(null);
            setValidationError("");

            // Refresh cards list
            fetchCards();
        } catch (error) {
            console.error("Recharge error:", error);
            toast.error("Failed to recharge card", {
                description: (error as Error).message,
            });
        } finally {
            setIsRecharging(false);
        }
    };

    const handleCardSelect = (card: IssuedCard) => {
        setSelectedCard(card);
        setRechargeAmount("");
        setValidationError("");
    };

    const getFacultyBadgeColor = (faculty: string) => {
        const colors: Record<string, string> = {
            tec: "bg-blue-100 text-blue-800",
            app: "bg-green-100 text-green-800",
            ssh: "bg-purple-100 text-purple-800",
            mgt: "bg-orange-100 text-orange-800",
            agr: "bg-yellow-100 text-yellow-800",
            med: "bg-red-100 text-red-800",
        };
        return colors[faculty] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Wallet className="h-8 w-8 text-emerald-600" />
                            Recharge Cards
                        </h1>
                        <p className="text-muted-foreground">
                            Add balance to student RFID cards
                        </p>
                    </div>
                </div>
                <DeviceStatus />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card Selection Panel */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Select Card to Recharge</CardTitle>
                                <CardDescription>
                                    Search, select, or swipe a card
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    nfcStatus.status === "connected"
                                        ? "default"
                                        : "secondary"
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* NFC Swipe Button */}
                        <Button
                            onClick={startNFCReading}
                            disabled={
                                nfcStatus.status !== "connected" ||
                                waitingForCard
                            }
                            variant="outline"
                            className="w-full border-2 border-dashed border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500"
                        >
                            {waitingForCard ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Waiting for card swipe...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Swipe Card on Reader
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or search manually
                                </span>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, reg number, or card UID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Cards List */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredCards.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No active cards found</p>
                                </div>
                            ) : (
                                filteredCards.map((card) => (
                                    <div
                                        key={card.card_uid}
                                        onClick={() => handleCardSelect(card)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                            selectedCard?.card_uid ===
                                            card.card_uid
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                                                : "border-gray-200 hover:border-emerald-300"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="font-semibold">
                                                    {card.full_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {card.register_number}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className={getFacultyBadgeColor(
                                                        card.faculty
                                                    )}
                                                >
                                                    {card.faculty.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">
                                                    Current Balance
                                                </p>
                                                <p className="text-lg font-bold text-emerald-600">
                                                    Rs. {card.balance}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recharge Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recharge Details</CardTitle>
                        <CardDescription>
                            Enter the amount to add to the card
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selectedCard ? (
                            <>
                                {/* Selected Card Info */}
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Selected Card
                                    </p>
                                    <p className="font-bold text-lg">
                                        {selectedCard.full_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCard.register_number} • Card:{" "}
                                        {selectedCard.card_uid}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-emerald-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">
                                                Current Balance:
                                            </span>
                                            <span className="font-bold text-emerald-600">
                                                Rs. {selectedCard.balance}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recharge Amount Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Recharge Amount (Rs.)
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Enter amount"
                                        value={rechargeAmount}
                                        onChange={(e) => {
                                            setRechargeAmount(e.target.value);
                                            validateAmount(e.target.value);
                                        }}
                                        className={`text-lg ${
                                            validationError
                                                ? "border-red-400 focus:border-red-500"
                                                : rechargeAmount &&
                                                    !validationError
                                                  ? "border-green-400 focus:border-green-500"
                                                  : ""
                                        }`}
                                    />
                                    {validationError && (
                                        <div className="flex items-center gap-1 text-red-600 text-sm">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>{validationError}</span>
                                        </div>
                                    )}
                                    {rechargeAmount && !validationError && (
                                        <div className="flex items-center gap-1 text-green-600 text-sm">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>
                                                Valid amount: Rs.{" "}
                                                {parseFloat(rechargeAmount)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Amount Buttons */}
                                <div>
                                    <Label className="mb-2 block">
                                        Quick Select
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[100, 250, 500, 1000, 2000, 5000].map(
                                            (amount) => (
                                                <Button
                                                    key={amount}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setRechargeAmount(
                                                            amount.toString()
                                                        );
                                                        validateAmount(
                                                            amount.toString()
                                                        );
                                                    }}
                                                    className="hover:bg-emerald-50 hover:border-emerald-400"
                                                >
                                                    Rs. {amount}
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* New Balance Preview */}
                                {rechargeAmount && !validationError && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            New Balance After Recharge
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    Rs.{" "}
                                                    {(
                                                        parseFloat(selectedCard.balance.toString()) +
                                                        parseFloat(rechargeAmount)
                                                    ).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {parseFloat(selectedCard.balance.toString()).toFixed(2)}{" "}
                                                    +{" "}
                                                    {parseFloat(rechargeAmount).toFixed(2)}
                                                </p>
                                            </div>
                                            <DollarSign className="h-8 w-8 text-blue-400" />
                                        </div>
                                    </div>
                                )}

                                {/* Recharge Button */}
                                <Button
                                    onClick={handleRecharge}
                                    disabled={
                                        !rechargeAmount ||
                                        !!validationError ||
                                        isRecharging
                                    }
                                    className="w-full"
                                    size="lg"
                                >
                                    {isRecharging ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Recharge Card
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    No Card Selected
                                </p>
                                <p className="text-sm">
                                    Please select a card from the list to
                                    continue
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* RFID Activity Logger */}
            <div className="mt-6">
                <RFIDLogger />
            </div>
        </div>
    );
}
