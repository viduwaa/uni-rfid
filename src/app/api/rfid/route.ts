import { NextRequest, NextResponse } from "next/server";
import { BaseStudent } from "@/types/student";
import { insertCardDetails } from "@/lib/queries";
import { io } from "socket.io-client";
import { Wifi, WifiOff, Smartphone, AlertCircle } from "lucide-react";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userid");
        const formData = await request.formData();

        const cardData: BaseStudent = {
            full_name: formData.get("fullName") as string,
            register_number: formData.get("regNo") as string,
            nic_no: formData.get("nic") as string,
            faculty: formData.get("faculty") as string,
            phone: formData.get("phone") as string,
            credits: formData.get("credits") as string,
            user_id: userId as string,
        };

        //await insertCardDetails(cardData);

        return NextResponse.json({
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("API Error:", error);
        //inform user about server error
        return NextResponse.json(
            {
                success: false,
                message: "Failed to insert lecturer",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
