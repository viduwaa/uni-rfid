import { NFC } from "nfc-pcsc";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
const nfc = new NFC();

let pendingWriteData = null;
let isWaitingForCard = false;

// Add book tag write data
let pendingBookTagWriteData = null;
let isWaitingForBookTag = false;

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
        console.log(`💳 ===== CARD DETECTED =====`);
        console.log(`🆔 UID: ${card.uid}`);
        console.log(`🏷️ Type: ${cardInfo.name}`);
        console.log(`📊 Current flags:`);
        console.log(`   - isWaitingForBookTag: ${isWaitingForBookTag}`);
        console.log(
            `   - pendingBookTagWriteData: ${!!pendingBookTagWriteData}`
        );
        console.log(`   - isWaitingForCard: ${isWaitingForCard}`);
        console.log(`   - pendingWriteData: ${!!pendingWriteData}`);
        console.log(`============================`);

        // Handle book tag write
        if (isWaitingForBookTag && pendingBookTagWriteData) {
            console.log("🎯 Detected as BOOK TAG WRITE operation");
            isWaitingForBookTag = false;
            try {
                console.log("📝 Calling writeBookTagData...");
                await writeBookTagData(reader, card, cardInfo, {
                    id: pendingBookTagWriteData.id,
                    barcode: pendingBookTagWriteData.barcode,
                    bookId: pendingBookTagWriteData.book_id,
                    title: pendingBookTagWriteData.title,
                    author: pendingBookTagWriteData.author,
                });

                console.log("✅ Book tag written successfully.");
                socket.emit("book-tag-write-complete", {
                    success: true,
                    uid: card.uid,
                    cardType: cardInfo,
                    bookCopy: pendingBookTagWriteData,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error("❌ Error writing book tag:", err.message);
                socket.emit("book-tag-write-failed", {
                    success: false,
                    error: err.message,
                    cardType: cardInfo,
                    timestamp: Date.now(),
                });
            } finally {
                pendingBookTagWriteData = null;
            }
        }
        // Handle student card write
        else if (isWaitingForCard && pendingWriteData) {
            console.log("🎯 Detected as STUDENT CARD WRITE operation");
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
        }
        // Handle reading (could be student card or book tag)
        else {
            try {
                // Read from Sector 1 first to check card type
                const cardData = await readCardData(reader, card, cardInfo, 1);
                console.log("📖 Data read from card:", cardData);

                // Check card type identifier
                if (
                    cardData.card_type === "STUDENT" &&
                    cardData.register_number &&
                    cardData.name
                ) {
                    // It's a student card
                    console.log("✅ Identified as STUDENT card");
                    socket.emit("nfc-swipe", {
                        uid: card.uid,
                        reader: reader.reader.name,
                        cardType: cardInfo,
                        timestamp: Date.now(),
                        error: null,
                        data: {
                            register_number: cardData.register_number,
                            name: cardData.name,
                            faculty_name: cardData.faculty_name,
                        },
                    });
                } else if (cardData.card_type === "BOOK") {
                    // It's a book tag, read from Sector 2
                    console.log(
                        "✅ Identified as BOOK tag, reading from Sector 2..."
                    );
                    try {
                        const bookTagData = await readBookTagData(
                            reader,
                            card,
                            cardInfo
                        );
                        console.log("📖 Book tag data read:", bookTagData);
                        socket.emit("book-tag-scanned", {
                            uid: card.uid,
                            reader: reader.reader.name,
                            cardType: cardInfo,
                            timestamp: Date.now(),
                            error: null,
                            rfidData: bookTagData, // Raw RFID data from the card
                        });
                    } catch (bookErr) {
                        console.log(
                            "⚠️ Could not read book tag data from Sector 2"
                        );
                        socket.emit("book-tag-scanned", {
                            uid: card.uid,
                            reader: reader.reader.name,
                            cardType: cardInfo,
                            timestamp: Date.now(),
                            error: null,
                            rfidData: null,
                        });
                    }
                } else {
                    // Unknown card type or uninitialized card
                    console.log(
                        "⚠️ Unknown card type or uninitialized card, trying as book tag..."
                    );
                    try {
                        const bookTagData = await readBookTagData(
                            reader,
                            card,
                            cardInfo
                        );
                        console.log("📖 Book tag data read:", bookTagData);
                        socket.emit("book-tag-scanned", {
                            uid: card.uid,
                            reader: reader.reader.name,
                            cardType: cardInfo,
                            timestamp: Date.now(),
                            error: null,
                            rfidData: bookTagData,
                        });
                    } catch (bookErr) {
                        console.log("⚠️ Could not read as book tag either");
                        socket.emit("book-tag-scanned", {
                            uid: card.uid,
                            reader: reader.reader.name,
                            cardType: cardInfo,
                            timestamp: Date.now(),
                            error: null,
                            rfidData: null,
                        });
                    }
                }
            } catch (err) {
                console.error("❌ Failed to read data:", err.message);
                // Try emitting as book tag scan without RFID data
                socket.emit("book-tag-scanned", {
                    uid: card.uid,
                    reader: reader.reader.name,
                    cardType: cardInfo,
                    timestamp: Date.now(),
                    error: null,
                    rfidData: null,
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
    console.log("✅ ===== MIDDLEWARE CONNECTED TO SOCKET SERVER =====");
    console.log("🔌 Socket ID:", socket.id);
    console.log("📡 Server URL: http://localhost:4000");
    socket.emit("nfc-reader-status", currentNFCStatus);
    console.log("====================================================");
});

// Listen for book tag write requests (global listener, not inside reader callback)
socket.on("write-book-tag", (bookData) => {
    console.log("📚 ===== BOOK TAG WRITE EVENT RECEIVED =====");
    console.log("📥 Received data:", JSON.stringify(bookData, null, 2));
    console.log("🏷️ Setting flags...");

    pendingBookTagWriteData = bookData;
    isWaitingForBookTag = true;

    console.log("✅ Flags set:");
    console.log("   - pendingBookTagWriteData:", !!pendingBookTagWriteData);
    console.log("   - isWaitingForBookTag:", isWaitingForBookTag);
    console.log("⏳ Now waiting for tag to be placed on reader...");
    console.log("===========================================");
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

        // Parse the data (first 16 bytes: card type + reg number, then name, faculty)
        const firstBlockStr = allData
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

        // Extract card type and register number
        let registerNumber = firstBlockStr;
        let cardType = "UNKNOWN";

        if (firstBlockStr.startsWith("STUDENT:")) {
            cardType = "STUDENT";
            registerNumber = firstBlockStr.substring(8); // Remove "STUDENT:" prefix
        } else if (firstBlockStr.startsWith("BOOK:")) {
            cardType = "BOOK";
            registerNumber = firstBlockStr.substring(5); // Remove "BOOK:" prefix
        }

        return {
            card_type: cardType,
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

        // Add card type prefix to register number
        const cardTypePrefix = "STUDENT:";
        const regWithType = cardTypePrefix + data.registerNumber;

        // Prepare data buffers (16 bytes each)
        const regBuffer = prepareBuffer(regWithType, 16);
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

        console.log(
            "✅ Ultralight/NTAG student card data written successfully with STUDENT card type"
        );
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

        // Prepare data buffers with card type identifier
        const prepareBuffer = (text) => {
            const buffer = Buffer.alloc(BLOCK_SIZE, 0);
            if (text) {
                buffer.write(String(text).slice(0, BLOCK_SIZE), "utf8");
            }
            return buffer;
        };

        // Block 0: Card type + Register number (STUDENT:reg_number)
        const cardTypePrefix = "STUDENT:";
        const regWithType = cardTypePrefix + data.registerNumber;

        // Write data directly to the blocks
        await reader.write(firstBlock, prepareBuffer(regWithType), BLOCK_SIZE);
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

        console.log(
            "✅ Student card data written successfully with STUDENT card type"
        );
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

// Book tag write function
async function writeBookTagData(reader, card, cardInfo, data) {
    const { id, barcode, bookId, title, author } = data;

    try {
        // Route to appropriate write function based on card type
        if (cardInfo.type === "MIFARE_ULTRALIGHT" || cardInfo.type === "NTAG") {
            await writeUltralightBookTag(reader, card, {
                barcode,
                title,
                author,
            });
        } else if (cardInfo.type === "MIFARE_CLASSIC") {
            await writeMifareClassicBookTag(reader, card, 2, {
                barcode,
                title,
                author,
            });
        } else {
            // Attempt MIFARE Classic as fallback
            console.log(
                "⚠️ Unknown card type, attempting MIFARE Classic write for book tag..."
            );
            await writeMifareClassicBookTag(reader, card, 2, {
                barcode,
                title,
                author,
            });
        }

        console.log("✅ Book tag data written successfully");
        return true;
    } catch (err) {
        console.error("❌ Error writing book tag:", err.message);
        throw err;
    }
}

// Write book tag to Ultralight/NTAG
async function writeUltralightBookTag(reader, card, data) {
    const START_PAGE = 4; // User memory starts at page 4

    try {
        const prepareBuffer = (text, totalSize) => {
            const buffer = Buffer.alloc(totalSize, 0);
            if (text) {
                buffer.write(String(text).slice(0, totalSize), "utf8");
            }
            return buffer;
        };

        // Add card type prefix to barcode
        const cardTypePrefix = "BOOK:";
        const barcodeWithType = cardTypePrefix + data.barcode;

        // Prepare data buffers (16 bytes for barcode, 32 for title, 16 for author)
        const barcodeBuffer = prepareBuffer(barcodeWithType, 16);
        const titleBuffer = prepareBuffer(data.title, 32); // Allow longer title
        const authorBuffer = prepareBuffer(data.author, 16);

        // Write in 4-byte chunks (Ultralight page size)
        // Write barcode with type (pages 4-7)
        for (let i = 0; i < 4; i++) {
            await reader.write(
                START_PAGE + i,
                barcodeBuffer.slice(i * 4, (i + 1) * 4),
                4
            );
        }

        // Write title (pages 8-15)
        for (let i = 0; i < 8; i++) {
            await reader.write(
                START_PAGE + 4 + i,
                titleBuffer.slice(i * 4, (i + 1) * 4),
                4
            );
        }

        // Write author (pages 16-19)
        for (let i = 0; i < 4; i++) {
            await reader.write(
                START_PAGE + 12 + i,
                authorBuffer.slice(i * 4, (i + 1) * 4),
                4
            );
        }

        console.log(
            "✅ Ultralight/NTAG book tag data written successfully with BOOK card type"
        );
        return true;
    } catch (err) {
        console.error(
            "❌ Error writing Ultralight/NTAG book tag:",
            err.message
        );
        throw err;
    }
}

// Write book tag to MIFARE Classic
async function writeMifareClassicBookTag(reader, card, sectorNumber, data) {
    const CUSTOM_KEY = "A0A1A2A3A4A5";
    const DEFAULT_KEY = "FFFFFFFFFFFF";
    const KEY_TYPE_A = 0x60;
    const BLOCK_SIZE = 16;

    const firstBlock = sectorNumber * 4;

    try {
        // Try to authenticate
        try {
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(CUSTOM_KEY, "hex"),
                card
            );
            console.log("🔑 Authenticated with custom key for book tag");
        } catch (customKeyError) {
            console.log(
                "🔑 Custom key failed, trying default key for book tag"
            );
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(DEFAULT_KEY, "hex"),
                card
            );
            console.log("🔑 Authenticated with default key for book tag");
        }

        // Prepare data buffers with card type identifier
        const prepareBuffer = (text) => {
            const buffer = Buffer.alloc(BLOCK_SIZE, 0);
            if (text) {
                buffer.write(String(text).slice(0, BLOCK_SIZE), "utf8");
            }
            return buffer;
        };

        // Block 0: Card type + Barcode (BOOK:barcode)
        const cardTypePrefix = "BOOK:";
        const barcodeWithType = cardTypePrefix + data.barcode;

        // Write data to blocks (using sector 2 to avoid conflict with student data)
        await reader.write(
            firstBlock,
            prepareBuffer(barcodeWithType),
            BLOCK_SIZE
        );
        await reader.write(
            firstBlock + 1,
            prepareBuffer(data.title),
            BLOCK_SIZE
        );
        await reader.write(
            firstBlock + 2,
            prepareBuffer(data.author),
            BLOCK_SIZE
        );

        console.log(
            "✅ MIFARE Classic book tag data written successfully with BOOK card type"
        );
        return true;
    } catch (err) {
        console.error("❌ Error writing MIFARE Classic book tag:", err.message);
        throw err;
    }
}

// Read book tag data from MIFARE Classic (Sector 2)
async function readMifareClassicBookTag(reader, card, sectorNumber) {
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
            console.log("🔑 Reading book tag with custom key");
        } catch (customKeyError) {
            console.log(
                "🔑 Custom key failed for reading book tag, trying default key"
            );
            await reader.authenticate(
                firstBlock,
                KEY_TYPE_A,
                Buffer.from(DEFAULT_KEY, "hex"),
                card
            );
            console.log("🔑 Reading book tag with default key");
        }

        // Read all three blocks (barcode, title, author)
        const barcodeData = await reader.read(firstBlock, BLOCK_SIZE);
        const titleData = await reader.read(secondBlock, BLOCK_SIZE);
        const authorData = await reader.read(thirdBlock, BLOCK_SIZE);

        // Convert to strings and trim nulls/spaces
        const firstBlockStr = barcodeData
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();
        const title = titleData.toString("utf-8").replace(/\0/g, "").trim();
        const author = authorData.toString("utf-8").replace(/\0/g, "").trim();

        // Extract barcode (remove BOOK: prefix if present)
        let barcode = firstBlockStr;
        if (firstBlockStr.startsWith("BOOK:")) {
            barcode = firstBlockStr.substring(5); // Remove "BOOK:" prefix
        }

        return {
            barcode: barcode,
            title: title,
            author: author,
        };
    } catch (err) {
        console.error("❌ Error reading MIFARE Classic book tag:", err.message);
        throw err;
    }
}

// Read book tag data from Ultralight/NTAG
async function readUltralightBookTag(reader, card) {
    const START_PAGE = 4;
    const PAGE_SIZE = 4;

    try {
        // Read barcode (pages 4-7, 16 bytes total)
        const barcodeBuffer = Buffer.alloc(16);
        for (let i = 0; i < 4; i++) {
            const data = await reader.read(START_PAGE + i, PAGE_SIZE);
            data.copy(barcodeBuffer, i * PAGE_SIZE);
        }

        // Read title (pages 8-15, 32 bytes total)
        const titleBuffer = Buffer.alloc(32);
        for (let i = 0; i < 8; i++) {
            const data = await reader.read(START_PAGE + 4 + i, PAGE_SIZE);
            data.copy(titleBuffer, i * PAGE_SIZE);
        }

        // Read author (pages 16-19, 16 bytes total)
        const authorBuffer = Buffer.alloc(16);
        for (let i = 0; i < 4; i++) {
            const data = await reader.read(START_PAGE + 12 + i, PAGE_SIZE);
            data.copy(authorBuffer, i * PAGE_SIZE);
        }

        // Convert to strings and trim
        const firstBlockStr = barcodeBuffer
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();
        const title = titleBuffer.toString("utf-8").replace(/\0/g, "").trim();
        const author = authorBuffer.toString("utf-8").replace(/\0/g, "").trim();

        // Extract barcode (remove BOOK: prefix if present)
        let barcode = firstBlockStr;
        if (firstBlockStr.startsWith("BOOK:")) {
            barcode = firstBlockStr.substring(5); // Remove "BOOK:" prefix
        }

        return {
            barcode: barcode,
            title: title,
            author: author,
        };
    } catch (err) {
        console.error(
            "❌ Error reading Ultralight/NTAG book tag:",
            err.message
        );
        throw err;
    }
}

// Generic function to read book tag data
async function readBookTagData(reader, card, cardInfo) {
    try {
        if (cardInfo.type === "MIFARE_ULTRALIGHT" || cardInfo.type === "NTAG") {
            return await readUltralightBookTag(reader, card);
        } else if (cardInfo.type === "MIFARE_CLASSIC") {
            return await readMifareClassicBookTag(reader, card, 2); // Sector 2 for books
        } else {
            // Attempt MIFARE Classic as fallback
            console.log(
                "⚠️ Unknown card type, attempting MIFARE Classic read for book tag..."
            );
            return await readMifareClassicBookTag(reader, card, 2);
        }
    } catch (err) {
        console.error("❌ Error reading book tag data:", err.message);
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
        const firstBlockStr = regData
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();
        const name = nameData.toString("utf-8").replace(/\0/g, "").trim();
        const facultyName = facultyData
            .toString("utf-8")
            .replace(/\0/g, "")
            .trim();

        // Extract card type and register number
        let registerNumber = firstBlockStr;
        let cardType = "UNKNOWN";

        if (firstBlockStr.startsWith("STUDENT:")) {
            cardType = "STUDENT";
            registerNumber = firstBlockStr.substring(8); // Remove "STUDENT:" prefix
        } else if (firstBlockStr.startsWith("BOOK:")) {
            cardType = "BOOK";
            registerNumber = firstBlockStr.substring(5); // Remove "BOOK:" prefix
        }

        return {
            card_type: cardType,
            register_number: registerNumber,
            name: name,
            faculty_name: facultyName,
        };
    } catch (err) {
        console.error("❌ Error reading MIFARE Classic card:", err.message);
        throw err;
    }
}
