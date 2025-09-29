"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

import {
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from "lucide-react";

interface RFIDLogEntry {
    id: string;
    timestamp: Date;
    type: "scan" | "lookup" | "transaction" | "error" | "success";
    message: string;
    details?: any;
}

interface RFIDLoggerProps {
    className?: string;
}

export function RFIDLogger({ className }: RFIDLoggerProps) {
    const [logs, setLogs] = useState<RFIDLogEntry[]>([]);
    const [isActive, setIsActive] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Listen for console logs from the canteen portal
    useEffect(() => {
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;

        console.log = (...args) => {
            const message = args.join(" ");

            // Filter RFID/transaction related logs
            if (
                message.includes("🔄") ||
                message.includes("🏷️") ||
                message.includes("💳") ||
                message.includes("✅") ||
                message.includes("❌") ||
                message.includes("🎫") ||
                message.includes("💰") ||
                message.includes("📊") ||
                message.includes("📤") ||
                message.includes("📥")
            ) {
                let type: RFIDLogEntry["type"] = "scan";
                if (message.includes("✅")) type = "success";
                else if (message.includes("❌")) type = "error";
                else if (message.includes("💳") || message.includes("💰"))
                    type = "transaction";
                else if (message.includes("🔍")) type = "lookup";

                setLogs((prev) =>
                    [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            timestamp: new Date(),
                            type,
                            message: message
                                .replace(/[🔄🏷️💳✅❌🎫💰📊📤📥🔍]/g, "")
                                .trim(),
                            details:
                                args.length > 1 ? args.slice(1) : undefined,
                        },
                    ].slice(-20)
                ); // Keep only last 20 logs

                setIsActive(true);
                setTimeout(() => setIsActive(false), 1000);
            }

            originalConsoleLog.apply(console, args);
        };

        console.error = (...args) => {
            const message = args.join(" ");

            if (
                message.includes("Transaction") ||
                message.includes("RFID") ||
                message.includes("Card")
            ) {
                setLogs((prev) =>
                    [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            timestamp: new Date(),
                            type: "error" as const,
                            message: message,
                            details:
                                args.length > 1 ? args.slice(1) : undefined,
                        },
                    ].slice(-20)
                );
            }

            originalConsoleError.apply(console, args);
        };

        return () => {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
        };
    }, []);

    // Auto-scroll to bottom when new logs are added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogIcon = (type: RFIDLogEntry["type"]) => {
        switch (type) {
            case "scan":
                return <Activity className="h-3 w-3" />;
            case "lookup":
                return <Clock className="h-3 w-3" />;
            case "transaction":
                return <Activity className="h-3 w-3" />;
            case "success":
                return <CheckCircle className="h-3 w-3" />;
            case "error":
                return <XCircle className="h-3 w-3" />;
            default:
                return <AlertTriangle className="h-3 w-3" />;
        }
    };

    const getLogColor = (type: RFIDLogEntry["type"]) => {
        switch (type) {
            case "scan":
                return "text-blue-600 bg-blue-50";
            case "lookup":
                return "text-yellow-600 bg-yellow-50";
            case "transaction":
                return "text-purple-600 bg-purple-50";
            case "success":
                return "text-green-600 bg-green-50";
            case "error":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div
                        className={`h-2 w-2 rounded-full transition-colors ${
                            isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    RFID Transaction Logs
                    <Badge variant="outline" className="ml-auto">
                        {logs.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 overflow-y-auto" ref={scrollRef}>
                    <div className="space-y-1">
                        {logs.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No RFID activity detected yet
                                <br />
                                <span className="text-xs">
                                    Start scanning cards to see logs here
                                </span>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`flex items-start gap-2 p-2 rounded text-xs ${getLogColor(log.type)}`}
                                >
                                    {getLogIcon(log.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-[10px] text-muted-foreground">
                                            {log.timestamp.toLocaleTimeString()}
                                        </div>
                                        <div className="truncate">
                                            {log.message}
                                        </div>
                                        {log.details && (
                                            <div className="text-[10px] opacity-75 truncate">
                                                {JSON.stringify(log.details)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
