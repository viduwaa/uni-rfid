"use client";

import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BaseStudent } from "@/types/student";
import dotenv from "dotenv";
import { useState } from "react";
import { toast } from "sonner";
import WriteCardComponent from "@/components/WriteCard";

// Load environment variables
dotenv.config();
let blob_token = process.env.NEXT_PUBLIC_BLOB_TOKEN;

interface AddMenuProps {
    onClose: () => void;
    studentData: BaseStudent;
}

export default function AddMenu({ onClose, studentData }: AddMenuProps) {
    const [validationCheck, setValidationCheck] = useState("");
    const [isWriting, setIsWriting] = useState(false);
    const userID = studentData.user_id;

    const handleWrite = async (event: React.FormEvent) => {
        event.preventDefault();

        //get form data
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        //validate form data
        const data = {
            fullName: formData.get("fullName") as string,
            registerNumber: formData.get("regNo") as string,
            nicNo: formData.get("nic") as string,
            faculty: formData.get("faculty") as string,
            phoneNumber: formData.get("phone") as string,
            credits: formData.get("credits") as string,
        };

        if (!data.credits || data.credits === "") {
            setValidationCheck("Enter a credit value");
            return; // Add return to prevent execution
        } else if (isNaN(parseInt(data.credits))) {
            setValidationCheck("Value cannot be a text");
            return; // Add return to prevent execution
        } else if (parseInt(data.credits) < 0) {
            setValidationCheck("Value cannot be minus value");
            return; // Add return to prevent execution
        }

        setValidationCheck("");
        setIsWriting(true);

        try {
            const response = await fetch(
                `/api/rfid?write=true&userid=${userID}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Write failed, please try again"
                );
            }
        } catch (error) {
            console.error("Error writing to the card", error);
            toast.error("Error writing to the card", {
                description: (error as Error).message + "\nPlease try again",
            });
        } finally {
            setIsWriting(false);
        }
    };

    const getFaculty = () => {
        switch (studentData.faculty) {
            case "tec":
                return "Technology";
            case "app":
                return "Applied Sciences";
            case "ssh":
                return "Social Sciences & Humanities";
            case "mgt":
                return "Management Studies";
            case "agr":
                return "Agriculture";
            case "med":
                return "Medicine and Allied Sciences";
            default:
                return "Faculty not specified";
        }
    };

    return (
        <>
            <div className="relative flex-1 p-4">
                <div className="absolute flex-1 z-5 inset-0 backdrop-blur-[2px]"></div>
                <div className="container relative -top-10 w-3/4 mx-auto z-10">
                    <Card className="grid grid-cols-4 p-4 gap-2">
                        <Card className="col-span-3">
                            <div
                                className="absolute cursor-pointer rounded-full bg-gray-700 text-white dark:bg-gray-800 hover:text-red-500 p-2 right-[-15] top-[-15]"
                                onClick={onClose}
                            >
                                <X size={28} />
                            </div>
                            <CardHeader className="grid grid-cols-2">
                                <div>
                                    <CardTitle className="mt-2 font-bold text-lg">
                                        Issue a new card
                                    </CardTitle>
                                    <CardDescription>
                                        Fill | Verify the card details
                                    </CardDescription>
                                </div>
                                <div className="grid place-content-end">
                                    {!studentData.photo ? (
                                        <CircleUser size={120} />
                                    ) : (
                                        <img
                                            src={studentData.photo + blob_token}
                                            alt="Avatar"
                                            className="h-[120px] w-[120px] object-cover"
                                        />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form action="" onSubmit={handleWrite}>
                                    <div className="space-y-2 mb-4">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Jane"
                                            disabled
                                            value={studentData.full_name}
                                            readOnly
                                        />
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            hidden
                                            defaultValue={studentData.full_name}
                                        />
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="regno">
                                                Registration Number
                                            </Label>
                                            <Input
                                                id="regno"
                                                placeholder="Jane"
                                                disabled
                                                readOnly
                                                value={studentData.register_number}
                                            />
                                            <Input
                                                id="regno"
                                                name="regno"
                                                hidden
                                                defaultValue={
                                                    studentData.register_number
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="nic">NIC No</Label>
                                            <Input
                                                id="nic"
                                                placeholder="2XXXXXXXV"
                                                disabled
                                                readOnly
                                                value={studentData.nic_no}
                                            />
                                            <Input
                                                id="nic"
                                                name="nic"
                                                hidden
                                                defaultValue={studentData.nic_no}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="faculty">Faculty</Label>
                                            <Input
                                                id="faculty"
                                                placeholder="Technology"
                                                disabled
                                                readOnly
                                                value={getFaculty()}
                                            />
                                            <Input
                                                id="faculty"
                                                name="faculty"
                                                hidden
                                                defaultValue={getFaculty()}
                                            />
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="credits">Credits</Label>
                                            <Input
                                                id="credits"
                                                name="credits"
                                                placeholder="100"
                                                required
                                                className="border-2 border-green-400"
                                            />
                                            {validationCheck && (
                                                <span className="text-red-500 text-sm">
                                                    {validationCheck}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Button type="submit" disabled={isWriting}>
                                            {isWriting
                                                ? "Writing..."
                                                : "Write to the card"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="">
                            <WriteCardComponent
                            student={studentData}
                            isWriting={isWriting}
                        />
                        </Card>
                    </Card>
                    
                </div>
            </div>
        </>
    );
}
