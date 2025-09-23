import { NextRequest, NextResponse } from "next/server";
import {
  updateBalance,
  getStudentByCardUID,
  getStudentBalance,
} from "@/lib/canteenQueries";

export async function GET(
  request: NextRequest,
  { params }: { params: { cardUID: string } }
) {
  try {
    const studentData = await getStudentByCardUID(params.cardUID);
    if (!studentData) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found or card inactive",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: studentData,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch student data",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { amount, description, card_uid } = await request.json();

    if (!amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount is required",
        },
        { status: 400 }
      );
    }

    const result = await updateBalance(
      params.userId,
      amount,
      description,
      card_uid
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update balance",
      },
      { status: 500 }
    );
  }
}

export async function GET_BALANCE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const balanceData = await getStudentBalance(params.userId);
    if (!balanceData) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found or no active card",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: balanceData,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch student balance",
      },
      { status: 500 }
    );
  }
}
