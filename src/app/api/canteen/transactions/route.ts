import { NextRequest, NextResponse } from "next/server";
import { createTransaction, getTransactionHistory } from "@/lib/canteenQueries";
import { TransactionRequest } from "@/types/canteen";

export async function POST(request: NextRequest) {
  try {
    const transactionData: TransactionRequest = await request.json();

    // Validate required fields before database insertion
    if (
      !transactionData.student_id ||
      !transactionData.items ||
      !Array.isArray(transactionData.items) ||
      transactionData.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: student_id and items array",
        },
        { status: 400 }
      );
    }

    const transactionResult = await createTransaction(transactionData);

    return NextResponse.json({
      success: true,
      data: transactionResult,
      status: 201,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create transaction",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    const transactionHistory = await getTransactionHistory(
      studentId,
      parseInt(page),
      parseInt(limit)
    );

    return NextResponse.json({
      success: true,
      data: transactionHistory,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transaction history",
      },
      { status: 500 }
    );
  }
}
