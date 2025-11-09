"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, BookOpen } from "lucide-react";

// Extended type for book copy with additional fields
type ExtendedBookCopy = {
    id: string;
    barcode: string;
    book_id: string;
    condition?: string;
    is_available?: boolean;
    book_title?: string;
    book_author?: string;
    book_isbn?: string;
    publisher?: string;
    category?: string;
    location?: string;
    created_at?: string;
    updated_at?: string;
};

interface WriteBookTagProps {
    bookCopy: ExtendedBookCopy;
    isWriting: boolean;
    onWriteComplete?: (
        success: boolean,
        message: string,
        rfidUID?: string
    ) => void;
}

interface NFCStatus {
    status: "connected" | "disconnected" | "error";
    reader: string | null;
    error: string | null;
}

interface WriteResult {
    success: boolean;
    uid?: string;
    bookCopy?: any;
    error?: string;
    timestamp: number;
}

export default function WriteBookTagComponent({
    bookCopy,
    isWriting,
    onWriteComplete,
}: WriteBookTagProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState<NFCStatus>({
        status: "disconnected",
        reader: null,
        error: null,
    });

    const [writeStatus, setWriteStatus] = useState<
        "idle" | "waiting" | "writing" | "success" | "error"
    >("idle");
    const [eventLog, setEventLog] = useState<string[]>([]);
    const [lastWriteResult, setLastWriteResult] = useState<WriteResult | null>(
        null
    );
    const [isConnected, setIsConnected] = useState(false);

    // Initialize socket connection
    useEffect(() => {
        const socketConnection = io("http://localhost:4000");
        setSocket(socketConnection);

        socketConnection.on("connect", () => {
            console.log("✅ Connected to NFC socket server");
            setIsConnected(true);
            setEventLog((prev) => [...prev, "🔌 Connected to NFC writer"]);
            socketConnection.emit("get-nfc-status");
        });

        socketConnection.on("disconnect", () => {
            console.log("❌ Disconnected from NFC socket server");
            setIsConnected(false);
            setEventLog((prev) => [...prev, "🔌 Disconnected from NFC writer"]);
        });

        socketConnection.on("nfc-reader-status", (status: NFCStatus) => {
            console.log("📡 NFC Writer status:", status);
            setNfcStatus(status);

            if (status.status === "connected") {
                setEventLog((prev) => [
                    ...prev,
                    `📲 Writer ready: ${status.reader}`,
                ]);
            } else if (status.status === "error") {
                setEventLog((prev) => [
                    ...prev,
                    `❌ Writer error: ${status.error}`,
                ]);
            }
        });

        // Handle book tag write completion
        socketConnection.on(
            "book-tag-write-complete",
            async (result: WriteResult) => {
                console.log("✅ Book tag written successfully:", result);
                setWriteStatus("success");
                setLastWriteResult(result);
                setEventLog((prev) => [
                    ...prev,
                    `✅ Book tag written successfully!`,
                    `📄 RFID UID: ${result.uid}`,
                    `📚 Book Copy: ${result.bookCopy?.barcode}`,
                    `📖 Title: ${result.bookCopy?.title}`,
                    `💾 Saving to database...`,
                ]);

                // Save to database after successful write
                try {
                    const requestBody = {
                        bookCopy: {
                            id: bookCopy.id,
                            barcode: bookCopy.barcode,
                            book_id: bookCopy.book_id,
                            book_title: bookCopy.book_title,
                            book_author: bookCopy.book_author,
                        },
                        rfid: {
                            uid: result.uid,
                            write_timestamp: result.timestamp || Date.now(),
                        },
                    };
                    console.log(
                        "🔍 Request body to API:",
                        JSON.stringify(requestBody, null, 2)
                    );

                    const dbResponse = await fetch(
                        "/api/library/rfid/write-complete",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestBody),
                        }
                    );

                    const dbResult = await dbResponse.json();

                    if (dbResult.success) {
                        console.log("✅ Database save successful:", dbResult);
                        setEventLog((prev) => [
                            ...prev,
                            `✅ Database: RFID tag data saved successfully`,
                            `🆔 Database ID: ${dbResult.data?.rfid_tag_id || "Generated"}`,
                        ]);
                    } else {
                        console.error("❌ Database save failed:", dbResult);
                        setEventLog((prev) => [
                            ...prev,
                            `❌ Database: Save failed - ${dbResult.message}`,
                        ]);
                    }
                } catch (dbError) {
                    console.error("❌ Database request error:", dbError);
                    setEventLog((prev) => [
                        ...prev,
                        `❌ Database: Request failed - ${(dbError as Error).message}`,
                    ]);
                }

                onWriteComplete?.(
                    true,
                    "Book tag written successfully",
                    result.uid
                );
            }
        );

        socketConnection.on("book-tag-write-failed", (result: WriteResult) => {
            console.log("❌ Book tag write failed:", result);
            setWriteStatus("error");
            setLastWriteResult(result);
            setEventLog((prev) => [
                ...prev,
                `❌ Write failed: ${result.error}`,
            ]);

            onWriteComplete?.(false, result.error || "Write operation failed");
        });

        // Add debugging for all socket events
        socketConnection.onAny((eventName, ...args) => {
            console.log(`🔊 Socket event received: ${eventName}`, args);
        });

        return () => {
            socketConnection.disconnect();
        };
    }, []);

    // Handle write trigger
    useEffect(() => {
        if (
            isWriting &&
            socket &&
            isConnected &&
            nfcStatus.status === "connected"
        ) {
            initiateWrite();
        }
    }, [isWriting, socket, isConnected, nfcStatus.status]);

    const initiateWrite = () => {
        if (!bookCopy || !socket) {
            console.error(
                "❌ Cannot initiate write - missing bookCopy or socket"
            );
            return;
        }

        console.log("🔍 ===== INITIATING BOOK TAG WRITE =====");
        console.log("📦 BookCopy data:", bookCopy);
        console.log("🔌 Socket connected:", socket.connected);
        console.log("📡 Socket ID:", socket.id);

        setWriteStatus("waiting");
        setEventLog((prev) => [
            ...prev,
            "🟢 Starting book tag write process...",
            "⏳ Please tap the RFID tag to the writer...",
        ]);

        // Send write command to NFC middleware
        const writeData = {
            id: bookCopy.id,
            barcode: bookCopy.barcode,
            book_id: bookCopy.book_id,
            title: bookCopy.book_title,
            author: bookCopy.book_author,
            timestamp: Date.now(),
        };

        console.log("📤 ===== EMITTING write-book-tag EVENT =====");
        console.log("📨 Write data:", JSON.stringify(writeData, null, 2));
        console.log("🎯 Event name: write-book-tag");

        socket.emit("write-book-tag", writeData);

        console.log("✅ Event emitted successfully");
        console.log("⏳ Waiting for response from middleware...");
        console.log("=========================================");

        setWriteStatus("writing");
        setEventLog((prev) => [
            ...prev,
            "📤 Write command sent to NFC middleware",
            "✍️ Waiting for tag contact...",
        ]);
    };

    const clearLog = () => {
        setEventLog([]);
        setLastWriteResult(null);
        setWriteStatus("idle");
    };

    const getStatusColor = () => {
        switch (writeStatus) {
            case "success":
                return "text-green-600";
            case "error":
                return "text-red-600";
            case "writing":
            case "waiting":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusIcon = () => {
        switch (writeStatus) {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case "writing":
            case "waiting":
                return <Clock className="h-4 w-4 text-blue-600" />;
            default:
                return <BookOpen className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon()}
                    Book RFID Tag Writer
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
                        Writer: {nfcStatus.reader || "None detected"}
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

                {/* Book Copy Information */}
                {bookCopy && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">
                            Writing Data:
                        </h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                            <div>
                                <strong>Title:</strong>{" "}
                                {bookCopy.book_title || "N/A"}
                            </div>
                            <div>
                                <strong>Author:</strong>{" "}
                                {bookCopy.book_author || "N/A"}
                            </div>
                            <div>
                                <strong>Barcode:</strong> {bookCopy.barcode}
                            </div>
                        </div>
                    </div>
                )}

                {/* Write Status */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span
                        className={`text-sm font-semibold ${getStatusColor()}`}
                    >
                        {writeStatus.charAt(0).toUpperCase() +
                            writeStatus.slice(1)}
                    </span>
                </div>

                {/* Last Write Result */}
                {lastWriteResult && (
                    <div
                        className={`p-3 rounded-lg border ${
                            lastWriteResult.success
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                        }`}
                    >
                        <h4
                            className={`font-semibold mb-1 ${
                                lastWriteResult.success
                                    ? "text-green-800"
                                    : "text-red-800"
                            }`}
                        >
                            {lastWriteResult.success
                                ? "✅ Write Successful"
                                : "❌ Write Failed"}
                        </h4>
                        {lastWriteResult.success && lastWriteResult.uid && (
                            <p className="text-xs text-green-700">
                                RFID UID: {lastWriteResult.uid}
                            </p>
                        )}
                        {!lastWriteResult.success && lastWriteResult.error && (
                            <p className="text-xs text-red-700">
                                Error: {lastWriteResult.error}
                            </p>
                        )}
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
                    <h4 className="font-semibold text-sm mb-2">📋 Write Log</h4>
                    <div className="text-xs max-h-32 overflow-y-auto space-y-1">
                        {eventLog.length === 0 ? (
                            <p className="text-gray-500">
                                Ready to write book tag...
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
