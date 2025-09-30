"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BaseStudent } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";

interface WriteCardProps {
    student: BaseStudent;
    isWriting: boolean;
    onWriteComplete?: (
        success: boolean,
        message: string,
        cardUID?: string
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
    student?: any;
    error?: string;
    timestamp: number;
}

export default function WriteCardComponent({
    student,
    isWriting,
    onWriteComplete,
}: WriteCardProps) {
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
            setEventLog((prev) => [...prev, "� Connected to NFC writer"]);
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

        // Update the write-complete handler
        socketConnection.on("write-complete", async (result: WriteResult) => {
            console.log("✅ Card write successful:", result);
            setWriteStatus("success");
            setLastWriteResult(result);
            setEventLog((prev) => [
                ...prev,
                `✅ Card written successfully!`,
                `📄 Card UID: ${result.uid}`,
                `👤 Student: ${result.student?.full_name}`,
                `🎓 Register: ${result.student?.register_number}`,
                `💾 Saving to database...`,
            ]);

            // Save to database after successful write
            try {
                const dbResponse = await fetch('/api/rfid/write-complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        student: {
                            user_id: student.user_id,
                            register_number: student.register_number,
                            full_name: student.full_name,
                            faculty: student.faculty,
                            nic_no: student.nic_no,
                        },
                        card: {
                            uid: result.uid,
                            write_timestamp: result.timestamp || Date.now(),
                        },
                        initial_balance: 0 // You can pass this from props if needed
                    }),
                });

                const dbResult = await dbResponse.json();
                
                if (dbResult.success) {
                    console.log("✅ Database save successful:", dbResult);
                    setEventLog((prev) => [
                        ...prev,
                        `✅ Database: Card data saved successfully`,
                        `🆔 Database ID: ${dbResult.data?.database_id || 'Generated'}`,
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

            onWriteComplete?.(true, "Card written successfully", result.uid);
        });

        socketConnection.on("write-failed", (result: WriteResult) => {
            console.log("❌ Card write failed:", result);
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
        if (!student || !socket) return;

        setWriteStatus("waiting");
        setEventLog((prev) => [
            ...prev,
            "🟢 Starting write process...",
            "⏳ Please tap your RFID card to the writer...",
        ]);

        // Send write command to NFC middleware
        const writeData = {
            user_id: student.user_id,
            register_number: student.register_number,
            full_name: student.full_name,
            faculty: student.faculty,
            nic_no: student.nic_no,
            timestamp: Date.now(),
        };

        console.log("📤 Sending write command to socket:", writeData);
        socket.emit("write-to-card", writeData);
        setWriteStatus("writing");
        setEventLog((prev) => [
            ...prev,
            "📤 Write command sent to NFC middleware",
            "✍️ Waiting for card contact...",
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
                return <CreditCard className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon()}
                    NFC Card Writer
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

                {/* Student Information */}
                {student && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">
                            Writing Data:
                        </h4>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                            <div>
                                <strong>Name:</strong> {student.full_name}
                            </div>
                            <div>
                                <strong>Register:</strong>{" "}
                                {student.register_number}
                            </div>
                            <div>
                                <strong>Faculty:</strong> {student.faculty}
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
                                Card UID: {lastWriteResult.uid}
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
                            <p className="text-gray-500">Ready to write...</p>
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
