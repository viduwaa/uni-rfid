import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*", // Allow connections from anywhere (adjust for production!)
    },
});

let currentNFCStatus = {
    status: "disconnected",
    reader: null,
    timestamp: Date.now(),
    error: null,
};

const clientsWithReaders = new Map(); // store PC clients with NFC

io.on("connection", (socket) => {
    console.log("📡 New device connected");

    // Fixed: Now properly updating the currentNFCStatus variable
    socket.on("nfc-reader-status", (statusData) => {
        console.log("🔌 Reader status:", statusData);

        // Update the server's current status
        currentNFCStatus = {
            ...currentNFCStatus,
            ...statusData,
        };

        // Broadcast to all connected clients
        io.emit("nfc-reader-status", currentNFCStatus);
    });

    socket.on("get-nfc-status", () => {
        console.log(
            "📋 Frontend requesting current NFC status:",
            currentNFCStatus
        );
        socket.emit("nfc-reader-status", currentNFCStatus);
    });

    socket.on("nfc-swipe", (data) => {
        console.log("💳 Card swiped:", data);
        io.emit("nfc-swipe", data);
        // Add database save logic here or real-time frontend update
    });

    socket.on("nfc-swipe-end", (data) => {
        console.log("👋 Card removed:", data);
        io.emit("nfc-swipe-end", data);
        // Optional handling
    });

    // Receive write request from frontend
    socket.on("write-to-card", (cardData) => {
        console.log("📝 Write request received from frontend:", cardData);
        io.emit("write-card-data", cardData);
    });

    // Get response back from PC when write is done
    socket.on("write-complete", (result) => {
        console.log("✅ Card write complete:", result);

        // Optionally broadcast to frontend or other systems
        io.emit("card-write-success", result);
    });

    socket.on("disconnect", () => {
        console.log("❌ Device disconnected");
    });
});

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
    console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
