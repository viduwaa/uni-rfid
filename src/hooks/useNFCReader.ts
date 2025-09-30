import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface NFCStatus {
    status: "connected" | "disconnected" | "error";
    reader: string | null;
    error: string | null;
    timestamp: number;
}

interface NFCCardData {
    uid: string;
    reader: string;
    timestamp: number;
    error: string | null;
    data: {
        register_number: string;
        name: string;
        faculty_name: string;
    };
}

export const useNFCReader = (serverUrl: string = "http://localhost:4000") => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState<NFCStatus>({
        status: "disconnected",
        reader: null,
        error: null,
        timestamp: Date.now(),
    });
    const [lastCardData, setLastCardData] = useState<NFCCardData | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketConnection = io(serverUrl);
        setSocket(socketConnection);

        socketConnection.on("connect", () => {
            console.log("✅ Connected to NFC socket server");
            setIsConnected(true);
            socketConnection.emit("get-nfc-status");
        });

        socketConnection.on("disconnect", () => {
            console.log("❌ Disconnected from NFC socket server");
            setIsConnected(false);
        });

        socketConnection.on("nfc-reader-status", (status: NFCStatus) => {
            console.log("📡 NFC Reader status updated:", status);
            setNfcStatus(status);
        });

        socketConnection.on("nfc-swipe", (data: NFCCardData) => {
            console.log("💳 Card swiped:", data);
            setLastCardData(data);
        });

        socketConnection.on("nfc-swipe-end", (data: { uid: string }) => {
            console.log("👋 Card removed:", data);
        });

        return () => {
            socketConnection.disconnect();
        };
    }, [serverUrl]);

    const requestNFCStatus = () => {
        if (socket && isConnected) {
            socket.emit("get-nfc-status");
        }
    };

    return {
        socket,
        nfcStatus,
        lastCardData,
        isConnected,
        requestNFCStatus,
        clearLastCardData: () => setLastCardData(null),
    };
};
