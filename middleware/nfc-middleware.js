import { read } from "fs";
import { NFC } from "nfc-pcsc";
import { io } from "socket.io-client";

// ✅ Replace with your main server's URL and port
const socket = io("http://localhost:4000");
const nfc = new NFC();

let currentNFCStatus = {
    status: "disconnected",
    reader: null,
    timestamp: Date.now(),
    error: null,
};

nfc.on("reader", (reader) => {
    console.log(`📲 Reader connected: ${reader.reader.name}`);

    // Update local status
    currentNFCStatus = {
        reader: reader.reader.name,
        status: "connected",
        timestamp: Date.now(),
        error: null,
    };

    // Notify server reader is connected
    socket.emit("nfc-reader-status", currentNFCStatus);

    reader.on("card", (card) => {
        console.log(`💳 Card detected:`, card.uid);
        // Send card swipe data to server
        socket.emit("nfc-swipe", {
            uid: card.uid,
            reader: reader.reader.name,
            timestamp: Date.now(),
            error: null,
        });
        
    });

    reader.on("card.off", (card) => {
        console.log(`❌ Card removed: ${card.uid}`);
        socket.emit("nfc-swipe-end", {
            uid: card.uid,
            reader: reader.reader.name,
            timestamp: Date.now(),
            error: null,
        });
    });

    reader.on("error", (err) => {
        console.error(`❗ Reader error:`, err.message);

        // Update local status
        currentNFCStatus = {
            reader: reader.reader.name,
            status: "connected",
            error: err.message,
            timestamp: Date.now(),
        };

        socket.emit("nfc-reader-status", currentNFCStatus);
    });

    reader.on("end", () => {
        console.log(`🔌 Reader disconnected: ${reader.reader.name}`);

        // Update local status
        currentNFCStatus = {
            reader: reader.reader.name,
            status: "disconnected",
            timestamp: Date.now(),
            error: null,
        };

        socket.emit("nfc-reader-status", currentNFCStatus);
    });
});

nfc.on("error", (err) => {
    console.error("❗ NFC Error:", err.message);

    // Update local status
    currentNFCStatus = {
        reader: null,
        status: "error",
        error: err.message,
        timestamp: Date.now(),
    };

    socket.emit("nfc-reader-status", currentNFCStatus);
});

// Send initial status when connecting to server
socket.on("connect", () => {
    console.log("✅ Connected to socket server");
    socket.emit("nfc-reader-status", currentNFCStatus);
});
