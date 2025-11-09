"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, BookOpen, Wifi } from "lucide-react";

interface BookTagData {
    rfid_uid: string;
    barcode: string;
    book_title: string;
    book_author: string;
    book_isbn?: string;
    is_available: boolean;
    condition: string;
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

interface ReadBookTagProps {
    onTagRead?: (bookData: BookTagData) => void;
}

interface NFCStatus {
    status: "connected" | "disconnected" | "error";
    reader: string | null;
    error: string | null;
}

interface SwipeEvent {
    uid: string;
    reader: string;
    timestamp: number;
    error: string | null;
    rfidData?: RFIDData | null;
}

export default function ReadBookTagComponent({ onTagRead }: ReadBookTagProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState<NFCStatus>({
        status: "disconnected",
        reader: null,
        error: null,
    });
    const [isConnected, setIsConnected] = useState(false);
    const [lastScannedBook, setLastScannedBook] = useState<BookTagData | null>(
        null
    );
    const [lastRFIDData, setLastRFIDData] = useState<RFIDData | null>(null);
    const [eventLog, setEventLog] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const socketConnection = io("http://localhost:4000");
        setSocket(socketConnection);

        socketConnection.on("connect", () => {
            console.log("✅ Connected to NFC socket server");
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
            } else if (status.status === "error") {
                setEventLog((prev) => [
                    ...prev,
                    `❌ Reader error: ${status.error}`,
                ]);
            }
        });

        // Handle book tag scan
        socketConnection.on("book-tag-scanned", async (event: SwipeEvent) => {
            console.log("📚 Book tag scanned:", event);
            setIsProcessing(true);
            setEventLog((prev) => [...prev, `📖 Tag detected: ${event.uid}`]);

            // Store RFID data if available
            if (event.rfidData) {
                setLastRFIDData(event.rfidData);
                setEventLog((prev) => [
                    ...prev,
                    `📡 RFID Data: ${event.rfidData?.barcode} - ${event.rfidData?.title}`,
                ]);
            } else {
                setLastRFIDData(null);
            }

            setEventLog((prev) => [
                ...prev,
                `⏳ Looking up book information...`,
            ]);

            try {
                // Fetch book data from API
                const response = await fetch(
                    `/api/library/rfid/book-copy?rfid_uid=${event.uid}`
                );
                const result = await response.json();

                if (result.success && result.data) {
                    const bookData: BookTagData = result.data;
                    setLastScannedBook(bookData);
                    setEventLog((prev) => [
                        ...prev,
                        `✅ Book found: ${bookData.book_title}`,
                        `👤 Author: ${bookData.book_author}`,
                        `📊 Status: ${bookData.is_available ? "Available" : "Checked Out"}`,
                    ]);
                    onTagRead?.(bookData);
                } else {
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Book not found or tag not registered`,
                    ]);
                    setLastScannedBook(null);
                }
            } catch (error) {
                console.error("❌ Error fetching book data:", error);
                setEventLog((prev) => [
                    ...prev,
                    `❌ Error: ${(error as Error).message}`,
                ]);
                setLastScannedBook(null);
            } finally {
                setIsProcessing(false);
            }
        });

        socketConnection.on("nfc-swipe-end", (event: any) => {
            console.log("📤 Tag removed:", event.uid);
        });

        return () => {
            socketConnection.disconnect();
        };
    }, []);

    const clearLog = () => {
        setEventLog([]);
    };

    const clearLastScan = () => {
        setLastScannedBook(null);
        setLastRFIDData(null);
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-4 w-4" />
                    Book RFID Tag Reader
                    <Badge
                        variant={
                            nfcStatus.status === "connected"
                                ? "default"
                                : "destructive"
                        }
                        className="ml-auto"
                    >
                        {nfcStatus.status}
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

                {/* Scanning Status */}
                {isProcessing && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-blue-600 animate-pulse" />
                            <span className="text-sm text-blue-800">
                                Processing tag...
                            </span>
                        </div>
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

                {/* Last Scanned Book */}
                {lastScannedBook && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-green-800">
                                📚 Book Information
                            </h4>
                            <Button
                                onClick={clearLastScan}
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                            >
                                Clear
                            </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <strong className="text-green-900">
                                    Title:
                                </strong>
                                <p className="text-green-800">
                                    {lastScannedBook.book_title}
                                </p>
                            </div>
                            <div>
                                <strong className="text-green-900">
                                    Author:
                                </strong>
                                <p className="text-green-800">
                                    {lastScannedBook.book_author}
                                </p>
                            </div>
                            <div>
                                <strong className="text-green-900">
                                    Barcode:
                                </strong>
                                <p className="text-green-800">
                                    {lastScannedBook.barcode}
                                </p>
                            </div>
                            {lastScannedBook.book_isbn && (
                                <div>
                                    <strong className="text-green-900">
                                        ISBN:
                                    </strong>
                                    <p className="text-green-800">
                                        {lastScannedBook.book_isbn}
                                    </p>
                                </div>
                            )}
                            <div className="flex items-center gap-2 pt-2">
                                <Badge
                                    variant={
                                        lastScannedBook.is_available
                                            ? "default"
                                            : "destructive"
                                    }
                                >
                                    {lastScannedBook.is_available
                                        ? "Available"
                                        : "Checked Out"}
                                </Badge>
                                <Badge variant="outline">
                                    {lastScannedBook.condition}
                                </Badge>
                            </div>
                            {lastScannedBook.current_loan && (
                                <div className="mt-2 pt-2 border-t border-green-300">
                                    <p className="text-xs text-green-700">
                                        <strong>Borrowed by:</strong>{" "}
                                        {
                                            lastScannedBook.current_loan
                                                .student_name
                                        }
                                    </p>
                                    <p className="text-xs text-green-700">
                                        <strong>Due:</strong>{" "}
                                        {new Date(
                                            lastScannedBook.current_loan.due_date
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!lastScannedBook && !isProcessing && (
                    <div className="bg-gray-50 p-3 rounded-lg border text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                            Tap a book RFID tag to read its information
                        </p>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={clearLog}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        Clear Log
                    </Button>
                </div>

                {/* Activity Log */}
                <div className="bg-gray-50 p-3 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-2">
                        📋 Activity Log
                    </h4>
                    <div className="text-xs max-h-32 overflow-y-auto space-y-1">
                        {eventLog.length === 0 ? (
                            <p className="text-gray-500">
                                Waiting for tag scan...
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
