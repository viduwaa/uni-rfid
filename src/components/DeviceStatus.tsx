import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Wifi, WifiOff, Smartphone, AlertCircle } from "lucide-react";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SOCKET_SERVER_URL =
    process.env.SOCKET_SERVER_URI || "http://localhost:4000";

export default function DeviceStatus() {
    const [isConnected, setIsConnected] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [timestamp, setTimestamp] = useState(null);
    const [status, setStatus] = useState("disconnected");
    const [error, setError] = useState("");

    useEffect(() => {
        console.log("🔌 Connecting to socket server...");
        const socket = io(SOCKET_SERVER_URL);

        // Handle connection
        socket.on("connect", () => {
            console.log("✅ Connected to socket server");
            socket.emit("get-nfc-status");
        });

        // Handle NFC reader status updates
        socket.on("nfc-reader-status", (data) => {
            console.log("📡 Received reader status:", data);

            setStatus(data.status);
            setIsConnected(data.status === "connected");
            setDeviceName(data.reader || "Unknown Device");
            setTimestamp(data.timestamp);
            setError(data.error || "");
        });

        socket.on("nfc-swipe", (data) => {
            console.log(data.uid);
        });

        // Handle socket disconnection
        socket.on("disconnect", () => {
            console.log("❌ Disconnected from socket server");
            setIsConnected(false);
            setStatus("disconnected");
        });

        // Handle connection errors
        socket.on("connect_error", (error) => {
            console.error("🚫 Connection error:", error);
            setIsConnected(false);
            setStatus("disconnected");
        });

        return () => {
            console.log("🔌 Cleaning up socket connection");
            socket.off("nfc-reader-status");
            socket.disconnect();
        };
    }, []);

    const formatTime = (timestamp: string) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString();
    };

    const getStatusColor = () => {
        switch (status) {
            case "connected":
                return "green";
            default:
                return "gray";
        }
    };

    const getStatusText = () => {
        switch (status) {
            case "connected":
                return "Connected";
            case "disconnected":
                return "Disconnected";
            default:
                return "Unknown";
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "connected":
                return <Wifi className="w-5 h-5 text-green-600" />;
            default:
                return <WifiOff className="w-5 h-5 text-gray-400" />;
        }
    };

    const colorClass = getStatusColor();

    return (
        <div className="max-w-sm mx-auto p-4">
            <div
                className={`rounded-lg border-2 p-4 transition-all duration-300 ${
                    colorClass === "green"
                        ? "border-green-200 bg-green-50 shadow-lg"
                        : "border-gray-200 bg-gray-50 shadow-sm"
                }`}
            >
                <div className="flex items-center space-x-3">
                    {/* Status Icon */}
                    <div
                        className={`p-2 rounded-full ${
                            colorClass === "green"
                                ? "bg-green-100"
                                : "bg-gray-100"
                        }`}
                    >
                        {getStatusIcon()}
                    </div>

                    {/* Device Info */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <Smartphone className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-800">
                                {deviceName || "NFC Reader"}
                            </h3>
                        </div>

                        <div className="flex items-center space-x-2 mt-1">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    colorClass === "green"
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                }`}
                            ></div>
                            <span
                                className={`text-sm font-medium ${
                                    colorClass === "green"
                                        ? "text-green-700"
                                        : "text-gray-500"
                                }`}
                            >
                                {getStatusText()}
                            </span>
                        </div>

                        {error && (
                            <p className="text-xs text-red-600 mt-1">
                                Error: {error}
                            </p>
                        )}

                        {timestamp && (
                            <p className="text-xs text-gray-500 mt-1">
                                Last update: {formatTime(timestamp)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
