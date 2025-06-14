"use client";

import type React from "react";
import "./add.css";
import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, ArrowLeft } from "lucide-react";
import { validateForm } from "./validateForm";
import { StudentForm } from "@/types/student";

export default function AddStudent() {
    const [isUploading, setIsUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<StudentForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);

            // Simulate upload delay
            setTimeout(() => {
                const file = e.target.files![0];
                const reader = new FileReader();

                reader.onload = (event) => {
                    setPhotoPreview(event.target?.result as string);
                    setIsUploading(false);
                };

                reader.readAsDataURL(file);
            }, 1000);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // get form data
        const form = event.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        //validate form data
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setValidationError(validationErrors);
            return;
        }

        //clear valdation errors
        setValidationError({});

        //start submitting
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/students/", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Submission failed");
            }

            toast.success("Student Registration success", {
                description: "Reidrecting to card registration",
            });

            form.reset();
            setPhotoPreview(null);
        } catch (error) {
            console.error("Error submitting form", error);
            toast.error("Error submitting form", {
                description: (error as Error).message + "\nPlease try again",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto p-6 space-y-6">
                <div className="mb-6 flex items-center ">
                    <Link href="/admin/dashboard" className="mr-4">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-center w-full mt-4">
                        Add New Student
                    </h1>
                </div>

                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                        <CardDescription>
                            Enter the details of the new student to register
                            them in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        {isSubmitting && (
                            <div className="formSubmission">
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Photo */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                                        {photoPreview ? (
                                            <img
                                                src={
                                                    photoPreview ||
                                                    "/placeholder.svg"
                                                }
                                                alt="Student preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Upload className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-0">
                                        <Label
                                            htmlFor="photo"
                                            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                        >
                                            Upload Photo
                                        </Label>

                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            name="photo"
                                            onChange={handlePhotoChange}
                                        />
                                        
                                    </div>
                                {validationError?.photo && (
                                    <span className="text-red-500 text-sm">
                                        {validationError.photo}
                                    </span>
                                )}
                                </div>

                                {/* Full name */}
                                <div className="grid grid-cols-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            placeholder="John Doe"
                                            name="fullName"
                                            required
                                        />
                                        {validationError?.fullName && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.fullName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Name with initials */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="initName">
                                            Name with initials
                                        </Label>
                                        <Input
                                            id="initName"
                                            placeholder="J.Doe"
                                            name="initName"
                                            required
                                        />
                                        {validationError?.initName && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.initName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="initName">
                                            NIC Number
                                        </Label>
                                        <Input
                                            id="initName"
                                            placeholder="2XXXXXXXXXV"
                                            name="nic_no"
                                            required
                                        />
                                        {validationError?.initName && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.initName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Register Number & Email */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="registerNumber">
                                            Register Number
                                        </Label>
                                        <Input
                                            id="registerNumber"
                                            placeholder="UNI2023001"
                                            name="registerNumber"
                                            required
                                        />
                                        {validationError?.registerNumber && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.registerNumber}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john.doe@university.edu"
                                            name="email"
                                            required
                                        />
                                        {validationError?.email && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.email}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Faculty */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="faculty">Faculty</Label>
                                        <Select name="faculty">
                                            <SelectTrigger id="faculty">
                                                <SelectValue placeholder="Select Faculty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tec">
                                                    Technology
                                                </SelectItem>
                                                <SelectItem value="app">
                                                    Applied Sciences
                                                </SelectItem>
                                                <SelectItem value="ssh">
                                                    Social Sciences & Humanities
                                                </SelectItem>
                                                <SelectItem value="mgt">
                                                    Management Studies
                                                </SelectItem>
                                                <SelectItem value="agr">
                                                    Agriculture
                                                </SelectItem>
                                                <SelectItem value="med">
                                                    Medicine and Allied Sciences
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {validationError?.faculty && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.faculty}
                                            </span>
                                        )}
                                    </div>

                                    {/* Year of Study */}
                                    <div className="space-y-2">
                                        <Label htmlFor="year">
                                            Year of Study
                                        </Label>
                                        <Select name="yearOfStudy">
                                            <SelectTrigger id="year">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    First Year
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Second Year
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    Third Year
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    Fourth Year
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {validationError?.yearOfStudy && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.yearOfStudy}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Student's address"
                                        name="address"
                                    />
                                    {validationError?.address && (
                                        <span className="text-red-500 text-sm">
                                            {validationError.address}
                                        </span>
                                    )}
                                </div>

                                {/* Phone Number & DOB */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="+1 (555) 123-4567"
                                            name="phone"
                                        />
                                        {validationError?.phoneNumber && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.phoneNumber}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">
                                            Date of Birth
                                        </Label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            name="dob"
                                        />
                                        {validationError?.dateOfBirth && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.dateOfBirth}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href="/admin/dashboard">
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit">Add Student</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
