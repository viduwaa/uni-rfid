import { NextRequest, NextResponse } from "next/server";
import { writeCardData } from "@/lib/canteenQueries";
import { NFCData } from "@/types/canteen";

export const config = {
  api: {
    bodyParser: true,
  },
};

export async function POST(request: NextRequest) {
  try {
    const nfcData: NFCData = await request.json();

    // Validate required fields
    if (!nfcData.register_number || !nfcData.full_name || !nfcData.faculty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: register_number, full_name, or faculty",
        },
        { status: 400 }
      );
    }

    // Write data to NFC card
    await writeCardData(nfcData);

    return NextResponse.json({
      success: true,
      message: "Write request sent to NFC reader. Please tap the card now.",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to write NFC card data",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
