"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertCircle,
    CheckCircle,
    BookOpen,
    Wifi,
    Loader2,
} from "lucide-react";

interface BookTagData {
    rfid_uid: string;
    barcode: string;
    book_title: string;
    book_author: string;
    book_isbn?: string;
    is_available: boolean;
    condition: string;
    book_copy_id: string;
    current_loan?: {
        student_name: string;
        due_date: string;
    };
}

interface RFIDData {
    barcode: string;
    title: string;
    author: string;
}

interface RFIDBookReaderProps {
    onBookScanned: (bookData: BookTagData) => void;
    isActive?: boolean;
    waitingMessage?: string;
}

interface NFCStatus {
    status: "connected" | "disconnected" | "error";
    reader: string | null;
    error: string | null;
}

interface BookTagScannedEvent {
    uid: string;
    reader: string;
    cardType: any;
    timestamp: number;
    error: string | null;
    rfidData?: RFIDData | null;
}

export default function RFIDBookReader({
    onBookScanned,
    isActive = true,
    waitingMessage = "Waiting for book tag...",
}: RFIDBookReaderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState<NFCStatus>({
        status: "disconnected",
        reader: null,
        error: null,
    });
    const [isConnected, setIsConnected] = useState(false);
    const [lastScannedUID, setLastScannedUID] = useState<string>("");
    const [lastRFIDData, setLastRFIDData] = useState<RFIDData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [eventLog, setEventLog] = useState<string[]>([]);

    useEffect(() => {
        const socketConnection = io("http://localhost:4000");
        setSocket(socketConnection);

        socketConnection.on("connect", () => {
            console.log("✅ Connected to NFC socket server (Book Reader)");
            setIsConnected(true);
            setEventLog((prev) => [...prev, "🔌 Connected to NFC reader"]);
            socketConnection.emit("get-nfc-status");
        });

        socketConnection.on("disconnect", () => {
            console.log("❌ Disconnected from NFC socket server");
            setIsConnected(false);
            setEventLog((prev) => [...prev, "🔌 Disconnected from NFC reader"]);
        });

        socketConnection.on("nfc-reader-status", (status: NFCStatus) => {
            console.log("📡 NFC Reader status:", status);
            setNfcStatus(status);

            if (status.status === "connected") {
                setEventLog((prev) => [
                    ...prev,
                    `📲 Reader ready: ${status.reader}`,
                ]);
            }
        });

        // Listen for book tag scans
        socketConnection.on(
            "book-tag-scanned",
            async (event: BookTagScannedEvent) => {
                if (!isActive) {
                    console.log("⚠️ Book reader inactive, ignoring scan");
                    return;
                }

                console.log("📖 Book tag scanned:", event);
                setIsProcessing(true);
                setEventLog((prev) => [
                    ...prev,
                    `📖 Book tag detected: ${event.uid}`,
                ]);
                setLastScannedUID(event.uid);

                // Store RFID data if available
                if (event.rfidData) {
                    setLastRFIDData(event.rfidData);
                    setEventLog((prev) => [
                        ...prev,
                        `📡 RFID Data Read:`,
                        `  Barcode: ${event.rfidData?.barcode || "N/A"}`,
                        `  Title: ${event.rfidData?.title || "N/A"}`,
                        `  Author: ${event.rfidData?.author || "N/A"}`,
                    ]);
                } else {
                    setLastRFIDData(null);
                    setEventLog((prev) => [
                        ...prev,
                        `⚠️ No RFID data found on tag`,
                    ]);
                }
                try {
                    // Fetch book data from API
                    const response = await fetch(
                        `/api/library/rfid/book-copy?uid=${event.uid}`
                    );
                    const result = await response.json();

                    if (result.success && result.data) {
                        const bookData: BookTagData = {
                            rfid_uid: event.uid,
                            barcode: result.data.barcode,
                            book_title: result.data.book_title,
                            book_author: result.data.book_author,
                            book_isbn: result.data.book_isbn,
                            is_available: result.data.is_available,
                            condition: result.data.condition,
                            book_copy_id: result.data.id, // This is the book_copy id
                            current_loan: result.data.current_loan,
                        };

                        console.log(
                            "✅ Book data prepared for callback:",
                            bookData
                        );

                        setEventLog((prev) => [
                            ...prev,
                            `✅ Book found: ${bookData.book_title}`,
                        ]);

                        // Call parent callback
                        onBookScanned(bookData);
                    } else {
                        setEventLog((prev) => [
                            ...prev,
                            `❌ Book not found in database`,
                        ]);
                    }
                } catch (error) {
                    console.error("Error fetching book data:", error);
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Error fetching book data`,
                    ]);
                } finally {
                    setIsProcessing(false);
                }
            }
        );

        return () => {
            socketConnection.disconnect();
        };
    }, [isActive, onBookScanned]);

    const clearLog = () => {
        setEventLog([]);
        setLastScannedUID("");
        setLastRFIDData(null);
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-4 w-4" />
                    RFID Book Scanner
                    <Badge
                        variant={
                            nfcStatus.status === "connected" && isActive
                                ? "default"
                                : "secondary"
                        }
                        className="ml-auto"
                    >
                        {!isActive ? "Inactive" : nfcStatus.status}
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Reader: {nfcStatus.reader || "None detected"}
                    </span>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                isConnected ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                        <span className="text-xs text-muted-foreground">
                            {isConnected ? "Connected" : "Disconnected"}
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Status Display */}
                {isActive && (
                    <div
                        className={`p-3 rounded-lg border ${
                            isProcessing
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 border-gray-200"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    <span className="text-sm text-blue-800">
                                        Processing book tag...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Wifi className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">
                                        {waitingMessage}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {!isActive && (
                    <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                                Book scanner inactive
                            </span>
                        </div>
                    </div>
                )}

                {/* Last Scanned UID */}
                {lastScannedUID && (
                    <div className="text-xs text-muted-foreground">
                        Last scanned UID:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                            {lastScannedUID}
                        </code>
                    </div>
                )}

                {/* RFID Tag Data Display */}
                {lastRFIDData && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            📡 Raw RFID Data from Tag
                        </h4>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">
                                    Barcode:
                                </span>
                                <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-900">
                                    {lastRFIDData.barcode || "N/A"}
                                </code>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">
                                    Title:
                                </span>
                                <span className="text-blue-900 text-right max-w-[200px] truncate">
                                    {lastRFIDData.title || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">
                                    Author:
                                </span>
                                <span className="text-blue-900 text-right max-w-[200px] truncate">
                                    {lastRFIDData.author || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Log */}
                <div className="bg-gray-50 p-3 rounded-lg border max-h-32 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">
                            📋 Activity Log
                        </h4>
                        {eventLog.length > 0 && (
                            <Button
                                onClick={clearLog}
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    <div className="text-xs space-y-1">
                        {eventLog.length === 0 ? (
                            <p className="text-gray-500">
                                {isActive
                                    ? "Ready to scan books..."
                                    : "Scanner inactive"}
                            </p>
                        ) : (
                            eventLog
                                .slice(-10)
                                .reverse()
                                .map((log, index) => (
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
