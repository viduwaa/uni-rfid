import { read } from "fs";
import { NFC } from "nfc-pcsc";
import { io } from "socket.io-client";

// ✅ Replace with your main server's URL and port
const socket = io("http://localhost:4000");
const nfc = new NFC();

let pendingWriteData = null;
let isWaitingForCard = false;

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

    // Step 1: Listen for card write request from server
    socket.on("write-card-data", (cardData) => {
        pendingWriteData = cardData;
        isWaitingForCard = true;
        console.log("📝 Received data to write. Tap a card now...");
    });

    // Step 2: When card is detected
    reader.on("card", async (card) => {
        if (!isWaitingForCard || !pendingWriteData) return;

        isWaitingForCard = false;
        try {
            const result = await writeIfNotExistsAndLock(reader, card, {
                sectorNumber: 1,
                keyA: "FFFFFFFFFFFF",
                newKeyA: "A0A1A2A3A4A5",
                newKeyB: "B0B1B2B3B4B5",
                dataToWrite: pendingWriteData.register_number,
            });

            if (result.skipped) {
                console.log("⚠️ Card already written. Skipping...");
                socket.emit("write-complete", {
                    success: false,
                    reason: "Data already exists",
                    uid: card.uid,
                    existing: result.existing,
                    timestamp: Date.now(),
                });
            } else {
                console.log("✅ Card written and locked.");
                socket.emit("write-complete", {
                    success: true,
                    uid: card.uid,
                    student: pendingWriteData,
                    timestamp: Date.now(),
                });
            }
        } catch (err) {
            console.error("❌ Error writing card:", err.message);
            socket.emit("write-complete", {
                success: false,
                error: err.message,
                timestamp: Date.now(),
            });
        } finally {
            pendingWriteData = null;
        }
    });


    reader.on("card", async (card) => {
        console.log(`💳 Card detected:`, card.uid);

        const sectorNumber = 1;
        const blockToRead = sectorNumber * 4; // Block 4 = sector 1, block 0
        const keyType = 0x60; // Authenticate with Key A
        const key = Buffer.from("A0A1A2A3A4A5", "hex"); // Replace if you locked with a custom key

        try {
            // Authenticate block
            await reader.authenticate(blockToRead, keyType, key, card);

            // Read 16 bytes
            const data = await reader.read(blockToRead, 16, 16);
            const text = data.toString("utf-8").trim();

            console.log("📖 Data read from card:", text);

            socket.emit("nfc-swipe", {
                uid: card.uid,
                reader: reader.reader.name,
                timestamp: Date.now(),
                error: null,
                data: text,
            });
        } catch (err) {
            console.error("❌ Failed to read data:", err.message);
        }
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

async function writeIfNotExistsAndLock(
    reader,
    card,
    {
        sectorNumber = 1,
        keyA = "FFFFFFFFFFFF",
        newKeyA = "A0A1A2A3A4A5",
        newKeyB = "B0B1B2B3B4B5",
        dataToWrite,
    }
) {
    const blockToUse = sectorNumber * 4;
    const trailerBlock = blockToUse + 3;

    await reader.authenticate(blockToUse, 0x60, Buffer.from(keyA, "hex"), card);

    const existing = await reader.read(blockToUse, 16, 16);

    // 🧠 Better blank check
    const isBlank = existing.every((b) => b === 0x00 || b === 0xff);

    if (!isBlank) {
        const text = existing.toString("utf-8").trim();
        return {
            success: false,
            reason: "Data already exists",
            uid: card.uid,
            existing: existing.toString("hex"),
            timestamp: Date.now(),
        };
    }

    // Write data
    const buffer = Buffer.alloc(16, " ");
    buffer.write(dataToWrite.slice(0, 16));
    await reader.write(blockToUse, buffer, 16);
    console.log("✅ Data written:", dataToWrite);

    // Lock sector
    await lockCardSector(reader, card, sectorNumber, newKeyA, newKeyB);

    return {
        success: true,
        uid: card.uid,
        timestamp: Date.now(),
    };
}

async function lockCardSector(reader, card, sectorNumber, keyA, keyB) {
    const trailerBlock = sectorNumber * 4 + 3;
    const keyType = 0x60;
    const defaultKey = "FFFFFFFFFFFF";

    await reader.authenticate(
        trailerBlock,
        keyType,
        Buffer.from(defaultKey, "hex"),
        card
    );

    const accessBits = Buffer.from([0xff, 0x07, 0x80, 0x69]);

    const trailerData = Buffer.concat([
        Buffer.from(keyA, "hex"),
        accessBits,
        Buffer.from(keyB, "hex"),
    ]);

    await reader.write(trailerBlock, trailerData, 16);
    console.log(`🔒 Sector ${sectorNumber} locked.`);
}
