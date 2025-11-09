import { NFC } from "nfc-pcsc";
import { io } from "socket.io-client";

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

// Card type detection helper
function detectCardType(card) {
    const atr = card.atr ? card.atr.toString("hex").toUpperCase() : "";
    const uidLength = card.uid.length;

    console.log(
        `🔍 Detecting card type - UID length: ${uidLength}, ATR: ${atr}`
    );

    // UID length is the most reliable indicator, check it first

    // MIFARE Ultralight / NTAG detection (7-byte UID = 14 hex chars)
    if (uidLength === 14) {
        // Check if it might be NTAG specifically
        if (atr.includes("0044") || atr.includes("0003")) {
            return { type: "NTAG", name: "NTAG (213/215/216)" };
        }
        return { type: "MIFARE_ULTRALIGHT", name: "MIFARE Ultralight/NTAG" };
    }

    // MIFARE Classic detection (4-byte UID = 8 hex chars)
    if (uidLength === 8) {
        return { type: "MIFARE_CLASSIC", name: "MIFARE Classic 1K/4K" };
    }

    // DESFire detection (can have variable UID length)
    if (atr.includes("7577") || atr.includes("7528")) {
        return { type: "DESFIRE", name: "MIFARE DESFire" };
    }

    // Fallback: try to determine from ATR if UID length is unusual
    if (atr.includes("0003")) {
        return { type: "MIFARE_CLASSIC", name: "MIFARE Classic 1K/4K (ATR)" };
    }

    if (atr.includes("0044")) {
        return { type: "MIFARE_ULTRALIGHT", name: "MIFARE Ultralight (ATR)" };
    }

    // Default fallback - try Ultralight first as it doesn't require authentication
    return {
        type: "MIFARE_ULTRALIGHT",
        name: "Unknown Card (trying Ultralight)",
    };
}

nfc.on("reader", (reader) => {
    console.log(`📲 Reader connected: ${reader.reader.name}`);

    currentNFCStatus = {
        reader: reader.reader.name,
        status: "connected",
        timestamp: Date.now(),
        error: null,
    };

    socket.emit("nfc-reader-status", currentNFCStatus);

    socket.on("write-card-data", (cardData) => {
        pendingWriteData = cardData;
        isWaitingForCard = true;
        console.log("📝 Received data to write. Tap a card now...");
    });

    reader.on("card", async (card) => {
        // Detect card type
        const cardInfo = detectCardType(card);
        console.log(`💳 Card detected: ${card.uid} - Type: ${cardInfo.name}`);

        if (isWaitingForCard && pendingWriteData) {
            isWaitingForCard = false;
            try {
                await writeCardData(reader, card, cardInfo, {
                    sectorNumber: 1,
                    registerNumber: pendingWriteData.register_number,
                    name: pendingWriteData.full_name,
                    facultyName: pendingWriteData.faculty,
                });

                console.log("✅ Card written successfully.");
                socket.emit("write-complete", {
                    success: true,
                    uid: card.uid,
                    cardType: cardInfo,
                    student: pendingWriteData,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error("❌ Error writing card:", err.message);
                socket.emit("write-failed", {
                    success: false,
                    error: err.message,
                    cardType: cardInfo,
                    timestamp: Date.now(),
                });
            } finally {
                pendingWriteData = null;
            }
        } else {
            try {
                const studentData = await readCardData(
                    reader,
                    card,
                    cardInfo,
                    1
                );
                console.log("📖 Data read from card:", studentData);

                socket.emit("nfc-swipe", {
                    uid: card.uid,
                    reader: reader.reader.name,
                    cardType: cardInfo,
                    timestamp: Date.now(),
                    error: null,
                    data: studentData,
                });
            } catch (err) {
                console.error("❌ Failed to read data:", err.message);
                socket.emit("nfc-swipe", {
                    uid: card.uid,
                    reader: reader.reader.name,
                    cardType: cardInfo,
                    timestamp: Date.now(),
                    error: err.message,
                    data: null,
                });
            }
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
    currentNFCStatus = {
        reader: null,
        status: "error",
        error: err.message,
        timestamp: Date.now(),
    };
    socket.emit("nfc-reader-status", currentNFCStatus);
});

socket.on("connect", () => {
    console.log("✅ Connected to socket server");
    socket.emit("nfc-reader-status", currentNFCStatus);
});

// MIFARE Ultralight / NTAG read function (no authentication needed)
async function readUltralightCard(reader, card) {
    const BLOCK_SIZE = 4; // Ultralight uses 4-byte pages
    const START_PAGE = 4; // User memory typically starts at page 4

    try {
        // Read multiple pages (pages 4-15 for NTAG213/Ultralight)
        const data1 = await reader.read(START_PAGE, 16); // Pages 4-7
        const data2 = await reader.read(START_PAGE + 4, 16); // Pages 8-11
        const data3 = await reader.read(START_PAGE + 8, 16); // Pages 12-15

        // Concatenate all data
        const allData = Buffer.concat([data1, data2, data3]);

        // Parse the data (assuming same format: reg number, name, faculty)
        const registerNumber = allData
            .slice(0, 16)
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();
        const name = allData
            .slice(16, 32)
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();
        const facultyName = allData
            .slice(32, 48)
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();

        return {
            register_number: registerNumber,
            name: name,
            faculty_name: facultyName,
        };
    } catch (err) {
        console.error("❌ Error reading Ultralight/NTAG card:", err.message);
        throw err;
    }
}

// MIFARE Ultralight / NTAG write function
async function writeUltralightCard(reader, card, data) {
    const START_PAGE = 4; // User memory starts at page 4

    try {
        const prepareBuffer = (text, totalSize) => {
            const buffer = Buffer.alloc(totalSize, 0);
            if (text) {
                buffer.write(String(text).slice(0, totalSize), "utf8");
            }
            return buffer;
        };

        // Prepare data buffers (16 bytes each)
        const regBuffer = prepareBuffer(data.registerNumber, 16);
        const nameBuffer = prepareBuffer(data.name, 16);
        const facultyBuffer = prepareBuffer(data.facultyName, 16);

        // Write in 4-byte chunks (Ultralight page size)
        for (let i = 0; i < 4; i++) {
            await reader.write(
                START_PAGE + i,
                regBuffer.slice(i * 4, (i + 1) * 4),
                4
            );
        }
        for (let i = 0; i < 4; i++) {
            await reader.write(
                START_PAGE + 4 + i,
                nameBuffer.slice(i * 4, (i + 1) * 4),
                4
            );
        }
        for (let i = 0; i < 4; i++) {
            await reader.write(
                START_PAGE + 8 + i,
                facultyBuffer.slice(i * 4, (i + 1) * 4),
                4
            );
        }

        console.log("✅ Ultralight/NTAG data written successfully");
        return true;
    } catch (err) {
        console.error("❌ Error writing Ultralight/NTAG card:", err.message);
        throw err;
    }
}

async function writeCardData(reader, card, cardInfo, data) {
    const { sectorNumber = 1, registerNumber, name, facultyName } = data;

    try {
        // Route to appropriate write function based on card type
        if (cardInfo.type === "MIFARE_ULTRALIGHT" || cardInfo.type === "NTAG") {
            await writeUltralightCard(reader, card, {
                registerNumber,
                name,
                facultyName,
            });
        } else if (cardInfo.type === "MIFARE_CLASSIC") {
            await clearAndWriteCardData(reader, card, sectorNumber, {
                registerNumber,
                name,
                facultyName,
            });
        } else {
            // Attempt MIFARE Classic as fallback
            console.log(
                "⚠️ Unknown card type, attempting MIFARE Classic write..."
            );
            await clearAndWriteCardData(reader, card, sectorNumber, {
                registerNumber,
                name,
                facultyName,
            });
        }

        console.log("✅ Card data written successfully");
        return true;
    } catch (err) {
        console.error("❌ Error writing card:", err.message);
        throw err;
    }
}

async function clearAndWriteCardData(reader, card, sectorNumber, data) {
    const CUSTOM_KEY = "A0A1A2A3A4A5";
    const DEFAULT_KEY = "FFFFFFFFFFFF";
    const KEY_TYPE_A = 0x60;
    const BLOCK_SIZE = 16;

    const firstBlock = sectorNumber * 4;
    let authenticatedKey = null;

    try {
        // Try to authenticate with custom key first
        try {
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(CUSTOM_KEY, "hex"),
                card
            );
            console.log("🔑 Authenticated with custom key");
            authenticatedKey = CUSTOM_KEY;
        } catch (customKeyError) {
            console.log("🔑 Custom key failed, trying default key");
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(DEFAULT_KEY, "hex"),
                card
            );
            console.log("🔑 Authenticated with default key");
            authenticatedKey = DEFAULT_KEY;
        }

        // Prepare data buffers
        const prepareBuffer = (text) => {
            const buffer = Buffer.alloc(BLOCK_SIZE, 0);
            if (text) {
                buffer.write(String(text).slice(0, BLOCK_SIZE), "utf8");
            }
            return buffer;
        };

        // Write data directly to the blocks
        await reader.write(
            firstBlock,
            prepareBuffer(data.registerNumber),
            BLOCK_SIZE
        );
        await reader.write(
            firstBlock + 1,
            prepareBuffer(data.name),
            BLOCK_SIZE
        );
        await reader.write(
            firstBlock + 2,
            prepareBuffer(data.facultyName),
            BLOCK_SIZE
        );

        console.log("✅ Data written successfully");
        return true;
    } catch (err) {
        console.error("❌ Error in clearAndWriteCardData:", err.message);
        throw err;
    }
}

async function readCardData(reader, card, cardInfo, sectorNumber) {
    try {
        // Route to appropriate read function based on card type
        if (cardInfo.type === "MIFARE_ULTRALIGHT" || cardInfo.type === "NTAG") {
            console.log("📖 Reading Ultralight/NTAG card...");
            return await readUltralightCard(reader, card);
        } else if (cardInfo.type === "MIFARE_CLASSIC") {
            console.log("📖 Reading MIFARE Classic card...");
            return await readMifareClassicCard(reader, card, sectorNumber);
        } else {
            // Attempt MIFARE Classic as fallback
            console.log(
                "⚠️ Unknown card type, attempting MIFARE Classic read..."
            );
            return await readMifareClassicCard(reader, card, sectorNumber);
        }
    } catch (err) {
        console.error("❌ Error reading card:", err.message);
        throw err;
    }
}

async function readMifareClassicCard(reader, card, sectorNumber) {
    const CUSTOM_KEY = "A0A1A2A3A4A5";
    const DEFAULT_KEY = "FFFFFFFFFFFF";
    const KEY_TYPE_A = 0x60;
    const BLOCK_SIZE = 16;

    const firstBlock = sectorNumber * 4;
    const secondBlock = sectorNumber * 4 + 1;
    const thirdBlock = sectorNumber * 4 + 2;

    try {
        // Try custom key first, then default
        try {
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(CUSTOM_KEY, "hex"),
                card
            );
            console.log("🔑 Reading with custom key");
        } catch (customKeyError) {
            console.log("🔑 Custom key failed for reading, trying default key");
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(DEFAULT_KEY, "hex"),
                card
            );
            console.log("🔑 Reading with default key");
        }

        // Read all three blocks
        const regData = await reader.read(firstBlock, BLOCK_SIZE);
        const nameData = await reader.read(secondBlock, BLOCK_SIZE);
        const facultyData = await reader.read(thirdBlock, BLOCK_SIZE);

        // Convert to strings and trim nulls/spaces
        const registerNumber = regData
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();
        const name = nameData.toString("utf-8").replace(/\0/g, "").trim();
        const facultyName = facultyData
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();

        return {
            register_number: registerNumber,
            name: name,
            faculty_name: facultyName,
        };
    } catch (err) {
        console.error("❌ Error reading MIFARE Classic card:", err.message);
        throw err;
    }
}
