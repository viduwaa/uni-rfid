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
import { CircleUser, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BaseStudent } from "@/types/student";
import { useState } from "react";
import { toast } from "sonner";
import WriteCardComponent from "@/components/WriteCard";

const blob_token = process.env.NEXT_PUBLIC_BLOB_TOKEN;

interface AddMenuProps {
    onClose: () => void;
    studentData: BaseStudent;
    onSuccess?: () => void;
    initialBalance?: number;
}

export default function AddMenu({
    onClose,
    studentData,
    onSuccess,
    initialBalance,
}: AddMenuProps) {
    const [formData, setFormData] = useState({
        credits: initialBalance?.toString() || "",
    });
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [isWriting, setIsWriting] = useState(false);
    const [writeStatus, setWriteStatus] = useState<
        "idle" | "preparing" | "writing" | "success" | "error"
    >("idle");
    const [isFormValid, setIsFormValid] = useState(false);

    // Validate form data
    const validateForm = (credits: string) => {
        const errors: Record<string, string> = {};

        if (!credits || credits.trim() === "") {
            errors.credits = "Enter a credit value";
        } else if (isNaN(parseFloat(credits))) {
            errors.credits = "Value must be a number";
        } else if (parseFloat(credits) < 0) {
            errors.credits = "Value cannot be negative";
        } else if (parseFloat(credits) > 10000) {
            errors.credits = "Value seems too high (max 10,000)";
        }

        setValidationErrors(errors);
        setIsFormValid(Object.keys(errors).length === 0);
        return Object.keys(errors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (field === "credits") {
            validateForm(value);
        }
    };

    // Handle write process - simplified version
    const handleWrite = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm(formData.credits)) {
            toast.error("Please fix validation errors");
            return;
        }

        const creditValue = parseFloat(formData.credits) || 0;
        console.log(
            "🔍 Form credits value:",
            formData.credits,
            typeof formData.credits
        );
        console.log("🔍 Parsed float value:", creditValue);
        console.log("🔍 Full formData:", formData);

        setWriteStatus("preparing");
        setIsWriting(true);

        // Just set the writing status and let WriteCard handle the NFC write
        // Database insertion will happen automatically after successful write
        setWriteStatus("writing");

        toast.success(
            "Please tap your card to the writer to complete the process"
        );
    };

    // Handle write completion from WriteCard component
    const handleWriteComplete = (
        success: boolean,
        message: string,
        cardUID?: string
    ) => {
        setIsWriting(false);

        if (success) {
            setWriteStatus("success");
            toast.success("Card issued successfully!", {
                description: `Card UID: ${cardUID}`,
            });

            // Call parent success callback
            onSuccess?.();

            // Auto-close after successful write and database save
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setWriteStatus("error");
            toast.error("Card write failed", {
                description: message,
            });
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
                <div className="container relative -top-10 mx-auto z-10">
                    <Card className="grid grid-cols-4 p-4 gap-2">
                        <Card className="col-span-3 ">
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
                                        <Label htmlFor="fullName">
                                            Full Name
                                        </Label>
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
                                                value={
                                                    studentData.register_number
                                                }
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
                                                defaultValue={
                                                    studentData.nic_no
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="faculty">
                                                Faculty
                                            </Label>
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
                                            <Label htmlFor="credits">
                                                Credits
                                            </Label>
                                            <Input
                                                id="credits"
                                                name="credits"
                                                value={formData.credits}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "credits",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="100"
                                                required
                                                className={`border-2 ${
                                                    validationErrors.credits
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-green-400 focus:border-green-500"
                                                }`}
                                            />
                                            {validationErrors.credits && (
                                                <div className="flex items-center gap-1 text-red-600 text-sm">
                                                    <AlertCircle className="h-3 w-3" />
                                                    <span>
                                                        {
                                                            validationErrors.credits
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {isFormValid &&
                                                formData.credits && (
                                                    <div className="flex items-center gap-1 text-green-600 text-sm">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>
                                                            Valid amount: Rs.
                                                            {parseFloat(
                                                                formData.credits
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    writeStatus === "success"
                                                        ? "bg-green-500"
                                                        : writeStatus ===
                                                            "error"
                                                          ? "bg-red-500"
                                                          : writeStatus ===
                                                              "writing"
                                                            ? "bg-blue-500"
                                                            : "bg-gray-300"
                                                }`}
                                            />
                                            <span className="text-muted-foreground">
                                                Status:{" "}
                                                {writeStatus
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    writeStatus.slice(1)}
                                            </span>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isWriting || !isFormValid}
                                            className={
                                                writeStatus === "success"
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : writeStatus === "error"
                                                      ? "bg-red-600 hover:bg-red-700"
                                                      : ""
                                            }
                                        >
                                            {writeStatus === "success"
                                                ? "✅ Card Issued"
                                                : writeStatus === "error"
                                                  ? "❌ Retry Write"
                                                  : writeStatus === "writing"
                                                    ? "✍️ Writing to Card..."
                                                    : writeStatus ===
                                                        "preparing"
                                                      ? "⏳ Preparing..."
                                                      : "💳 Issue Card"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <div className="space-y-4">
                            <WriteCardComponent
                                student={studentData}
                                isWriting={isWriting}
                                initialBalance={
                                    parseFloat(formData.credits) || 0
                                }
                                onWriteComplete={handleWriteComplete}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
