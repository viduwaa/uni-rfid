"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Wifi,
    WifiOff,
    AlertTriangle,
    RefreshCw,
    CheckCircle,
    Radio,
} from "lucide-react";

interface NFCReaderStatus {
    status: "connected" | "disconnected" | "error";
    reader: string | null;
    timestamp: number;
    error: string | null;
}

interface NFCStatusProps {
    status: NFCReaderStatus;
    isSocketConnected: boolean;
    onRefresh: () => void;
}

export default function NFCStatus({
    status,
    isSocketConnected,
    onRefresh,
}: NFCStatusProps) {
    const getStatusIcon = () => {
        if (!isSocketConnected) {
            return <WifiOff className="h-4 w-4" />;
        }

        switch (status.status) {
            case "connected":
                return <CheckCircle className="h-4 w-4" />;
            case "disconnected":
                return <Radio className="h-4 w-4" />;
            case "error":
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <WifiOff className="h-4 w-4" />;
        }
    };

    const getStatusColor = () => {
        if (!isSocketConnected) {
            return "bg-gray-100 text-gray-800 border-gray-300";
        }

        switch (status.status) {
            case "connected":
                return "bg-green-100 text-green-800 border-green-300";
            case "disconnected":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "error":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusText = () => {
        if (!isSocketConnected) {
            return "Socket Disconnected";
        }

        switch (status.status) {
            case "connected":
                return `Connected: ${status.reader}`;
            case "disconnected":
                return "NFC Reader Disconnected";
            case "error":
                return `Error: ${status.error}`;
            default:
                return "Unknown Status";
        }
    };

    const getStatusDescription = () => {
        if (!isSocketConnected) {
            return "Cannot connect to NFC service. Please check if the NFC middleware is running.";
        }

        switch (status.status) {
            case "connected":
                return "Ready to scan NFC cards for attendance";
            case "disconnected":
                return "Please connect your NFC reader to start scanning cards";
            case "error":
                return status.error || "An error occurred with the NFC reader";
            default:
                return "Checking NFC reader status...";
        }
    };

    return (
        <Card className="bg-white border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`p-2 rounded-lg border ${
                                status.status === "connected" &&
                                isSocketConnected
                                    ? "bg-green-50 border-green-200"
                                    : status.status === "error" ||
                                        !isSocketConnected
                                      ? "bg-red-50 border-red-200"
                                      : "bg-yellow-50 border-yellow-200"
                            }`}
                        >
                            {getStatusIcon()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`${getStatusColor()} font-medium`}
                                >
                                    {getStatusText()}
                                </Badge>
                                {status.timestamp && (
                                    <span className="text-xs text-gray-500">
                                        Updated:{" "}
                                        {new Date(
                                            status.timestamp
                                        ).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {getStatusDescription()}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                    </Button>
                </div>

                {/* Connection Instructions */}
                {(!isSocketConnected || status.status !== "connected") && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            Setup Instructions:
                        </h4>
                        <ol className="text-xs text-blue-800 space-y-1">
                            <li>
                                1. Ensure NFC reader is connected to your
                                computer
                            </li>
                            <li>
                                2. Start the NFC middleware:{" "}
                                <code className="bg-blue-100 px-1 rounded">
                                    npm run nfc
                                </code>
                            </li>
                            <li>
                                3. Start the socket server:{" "}
                                <code className="bg-blue-100 px-1 rounded">
                                    npm run socket
                                </code>
                            </li>
                            <li>4. Refresh this status panel</li>
                        </ol>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
