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
        if (isWaitingForCard && pendingWriteData) {
            isWaitingForCard = false;
            try {
                await writeCardData(reader, card, {
                    sectorNumber: 1,
                    registerNumber: pendingWriteData.register_number,
                    name: pendingWriteData.full_name,
                    facultyName: pendingWriteData.faculty,
                });

                console.log("✅ Card written successfully.");
                socket.emit("write-complete", {
                    success: true,
                    uid: card.uid,
                    student: pendingWriteData,
                    timestamp: Date.now(),
                });
            } catch (err) {
                console.error("❌ Error writing card:", err.message);
                socket.emit("write-failed", {
                    success: false,
                    error: err.message,
                    timestamp: Date.now(),
                });
            } finally {
                pendingWriteData = null;
            }
        } else {
            console.log(`💳 Card detected:`, card.uid);
            try {
                const studentData = await readCardData(reader, card, 1);
                console.log("📖 Data read from card:", studentData);

                socket.emit("nfc-swipe", {
                    uid: card.uid,
                    reader: reader.reader.name,
                    timestamp: Date.now(),
                    error: null,
                    data: studentData,
                });
            } catch (err) {
                console.error("❌ Failed to read data:", err.message);
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

async function writeCardData(reader, card, data) {
    const { sectorNumber = 1, registerNumber, name, facultyName } = data;
    
    try {
        // Simply clear and write data without changing keys
        await clearAndWriteCardData(reader, card, sectorNumber, {
            registerNumber,
            name,
            facultyName
        });
        
        console.log('✅ New data written successfully');
        return true;
    } catch (err) {
        console.error('❌ Error writing card:', err.message);
        throw err;
    }
}

async function clearAndWriteCardData(reader, card, sectorNumber, data) {
    const CUSTOM_KEY = 'A0A1A2A3A4A5';
    const DEFAULT_KEY = 'FFFFFFFFFFFF';
    const KEY_TYPE_A = 0x60;
    const BLOCK_SIZE = 16;
    
    const firstBlock = sectorNumber * 4;
    let authenticatedKey = null;
    
    try {
        // Try to authenticate with custom key first
        try {
            await reader.authenticate(firstBlock, KEY_TYPE_A, Buffer.from(CUSTOM_KEY, 'hex'), card);
            console.log('🔑 Authenticated with custom key');
            authenticatedKey = CUSTOM_KEY;
        } catch (customKeyError) {
            console.log('🔑 Custom key failed, trying default key');
            await reader.authenticate(firstBlock, KEY_TYPE_A, Buffer.from(DEFAULT_KEY, 'hex'), card);
            console.log('🔑 Authenticated with default key');
            authenticatedKey = DEFAULT_KEY;
        }
        
        // Prepare data buffers
        const prepareBuffer = (text) => {
            const buffer = Buffer.alloc(BLOCK_SIZE, 0);
            if (text) {
                buffer.write(String(text).slice(0, BLOCK_SIZE), 'utf8');
            }
            return buffer;
        };
        
        // Write data directly to the blocks
        await reader.write(firstBlock, prepareBuffer(data.registerNumber), BLOCK_SIZE);
        await reader.write(firstBlock + 1, prepareBuffer(data.name), BLOCK_SIZE);
        await reader.write(firstBlock + 2, prepareBuffer(data.facultyName), BLOCK_SIZE);
        
        console.log('✅ Data written successfully');
        return true;
        
    } catch (err) {
        console.error('❌ Error in clearAndWriteCardData:', err.message);
        throw err;
    }
}


async function readCardData(reader, card, sectorNumber) {
    const CUSTOM_KEY = 'A0A1A2A3A4A5';
    const DEFAULT_KEY = 'FFFFFFFFFFFF';
    const KEY_TYPE_A = 0x60;
    const BLOCK_SIZE = 16;

    const firstBlock = sectorNumber * 4;
    const secondBlock = sectorNumber * 4 + 1;
    const thirdBlock = sectorNumber * 4 + 2;

    try {
        // Try custom key first, then default
        try {
            await reader.authenticate(firstBlock, KEY_TYPE_A, Buffer.from(CUSTOM_KEY, 'hex'), card);
            console.log('🔑 Reading with custom key');
        } catch (customKeyError) {
            console.log('🔑 Custom key failed for reading, trying default key');
            await reader.authenticate(firstBlock, KEY_TYPE_A, Buffer.from(DEFAULT_KEY, 'hex'), card);
            console.log('🔑 Reading with default key');
        }

        // Read all three blocks
        const regData = await reader.read(firstBlock, BLOCK_SIZE);
        const nameData = await reader.read(secondBlock, BLOCK_SIZE);
        const facultyData = await reader.read(thirdBlock, BLOCK_SIZE);

        // Convert to strings and trim nulls/spaces
        const registerNumber = regData.toString("utf-8").replace(/\0/g, '').trim();
        const name = nameData.toString("utf-8").replace(/\0/g, '').trim();
        const facultyName = facultyData.toString("utf-8").replace(/\0/g, '').trim();

        return {
            register_number: registerNumber,
            name: name,
            faculty_name: facultyName,
        };
    } catch (err) {
        console.error("❌ Error reading card:", err.message);
        throw err;
    }
}
