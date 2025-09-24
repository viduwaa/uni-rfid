import { NextRequest, NextResponse } from "next/server";
import { updateBalance } from "@/lib/canteenQueries";


export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: userId or amount",
        },
        { status: 400 }
      );
    }

    const result = await updateBalance(userId, amount, description);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Balance topped up successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to top up balance",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
