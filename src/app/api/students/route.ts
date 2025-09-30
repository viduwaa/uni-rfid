import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { insertStudent, notIssued } from "@/lib/adminQueries";
import { StudentForm } from "@/types/student";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        let photoURL = null;
        const photo = formData.get("photo") as File | null;
        const regNo = formData.get("registerNumber") as string;

        if (photo && photo.size > 0) {
            const fileExtension = photo.name.split(".").pop();
            const buffer = Buffer.from(await photo.arrayBuffer());

            photoURL = await uploadFile(
                buffer,
                regNo,
                photo.type,
                fileExtension
            );
        }

        const studentData: StudentForm = {
            fullName: formData.get("fullName") as string,
            initName: formData.get("initName") as string,
            registerNumber: formData.get("registerNumber") as string,
            email: formData.get("email") as string,
            faculty: formData.get("faculty") as string,
            yearOfStudy: formData.get("yearOfStudy") as string,
            address: formData.get("address") as string,
            phoneNumber: formData.get("phone") as string,
            dateOfBirth: formData.get("dob") as string,
            nicNumber: formData.get("nicno") as string,
        };

        // Validate required fields before database insertion
        if (
            !studentData.email ||
            !studentData.fullName ||
            !studentData.registerNumber
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: email, fullName, or registerNumber",
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email format",
                },
                { status: 400 }
            );
        }

        await insertStudent(studentData, photoURL);

        return NextResponse.json({
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("API Error:", error);

        // Handle duplicate error from your database
        if ((error as Error).name === "Duplicate Error") {
            return NextResponse.json(
                {
                    success: false,
                    message: (error as Error).message,
                },
                { status: 400 }
            );
        }

        // Generic server error
        return NextResponse.json(
            {
                success: false,
                message: "Failed to insert student",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cardNotIssued = searchParams.get("notissued");
        const registerNumber = searchParams.get("register_number");

        // Handle get student by register number for NFC card reading
        if (registerNumber) {
            const { getStudentByRegisterNumber } = await import(
                "@/lib/canteenQueries"
            );
            const student = await getStudentByRegisterNumber(registerNumber);

            if (student) {
                return NextResponse.json({
                    success: true,
                    data: student,
                });
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Student not found",
                    },
                    { status: 404 }
                );
            }
        }

        // Handle get students without cards issued
        if (cardNotIssued == "true") {
            const students = await notIssued();

            return NextResponse.json({
                success: true,
                data: students,
                count: students?.length ?? 0,
            });
        }

        return NextResponse.json({
            success: false,
            message: "Invalid query parameter",
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch students",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
