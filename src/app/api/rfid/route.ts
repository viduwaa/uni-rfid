import { NextRequest, NextResponse } from "next/server";
import { BaseStudent } from "@/types/student";
import { insertCardDetails } from "@/lib/adminQueries";
import { io } from "socket.io-client";
import { Wifi, WifiOff, Smartphone, AlertCircle } from "lucide-react";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");

        if (action === "status") {
            // Return NFC writer status or similar
            return NextResponse.json({
                success: true,
                data: {
                    nfc_writer_status: "ready",
                    socket_server: SOCKET_SERVER_URL,
                    timestamp: new Date().toISOString(),
                },
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: "Invalid action or missing parameters",
            },
            { status: 400 }
        );
    } catch (error) {
        console.error("GET API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, credits, action } = body;

        console.log('Received data:', { user_id, credits, action });

        // Validate required fields
        if (!user_id || !credits || !action) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: user_id, credits, or action",
                },
                { status: 400 }
            );
        }

        switch (action) {
            case "issue_card":
                // Just confirm the card data is ready for writing
                // Database insertion will happen after successful NFC write
                const cardPreparation = {
                    user_id,
                    initial_balance: parseFloat(credits),
                    prepared_at: new Date().toISOString(),
                    status: 'PREPARED_FOR_WRITING'
                };

                return NextResponse.json({
                    success: true,
                    message: "Card data prepared successfully. Ready for NFC writing.",
                    data: cardPreparation
                });

            default:
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid action",
                    },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}