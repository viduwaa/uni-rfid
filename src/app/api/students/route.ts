import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { insertStudent } from "@/lib/queries";
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
        };

        console.log(studentData.phoneNumber);
        await insertStudent(studentData, photoURL);


        return NextResponse.json({
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("API Error:", error);

        //inform user reg no or email exists
        if((error as Error).name == "Duplicate Error" ){
            return NextResponse.json({
                success: false,
                message: (error as Error).message
            },{
                status : 400
            })
        }

        //inform user about server error
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
