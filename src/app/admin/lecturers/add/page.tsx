"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { LecturerForm } from "@/types/lecturers";
import { validateForm } from "./validateForm";

export default function AddLecturer() {
    const [isUploading, setIsUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<LecturerForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // faculty code (tec/app/ssh/...) and email state to auto-update domain
    const [facultyValue, setFacultyValue] = useState<string | undefined>(
        undefined
    );
    const [email, setEmail] = useState<string>("");
    const [regNo, setRegNo] = useState<string>("");
    const [maxDate, setMaxDate] = useState<string>("");

    const facultyDomains: Record<string, string> = {
        tec: "tec.rjt.ac.lk",
        agr: "agri.rjt.ac.lk",
        app: "as.rjt.ac.lk",
        mgt: "mgt.rjt.ac.lk",
        med: "med.rjt.ac.lk",
        ssh: "ssh.rjt.ac.lk",
    };

    // when faculty changes, update the domain part of the email
    useEffect(() => {
        // set today's date for DOB max on mount
        setMaxDate(new Date().toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        if (!facultyValue) return;
        const domain = facultyDomains[facultyValue];
        if (!domain) return;

        // If the user entered a full/personal email (contains "@"), don't overwrite it.
        if (email.includes("@")) return;

        // Use current email (as local part) or fallback to regNo
        const local = email || regNo;
        if (!local) return;

        const cleaned = local.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const newEmail = `${cleaned}@${domain}`;
        if (email !== newEmail) setEmail(newEmail);
    }, [facultyValue, regNo, email]);

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
        // client-side DOB check: prevent future dates
        const dob = (formData.get("dob") as string) || "";
        const today = new Date().toISOString().split("T")[0];
        if (dob && dob > today) {
            setValidationError((prev) => ({
                ...(prev || {}),
                dateOfBirth: "Date of birth cannot be in the future",
            }));
            return;
        }

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
            const response = await fetch("/api/lecturers/", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Submission failed");
            }

            toast.success("Lecturer Registration success");

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
                {/* back button */}
                <div className="mb-6 flex items-center text-center">
                    <Link href="/admin/dashboard" className="mr-4">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-center w-full mt-4">
                        Add New Lecturer
                    </h1>
                </div>

                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle>Lecturer Information</CardTitle>
                        <CardDescription>
                            Enter the details of the new lecturer to register
                            them in the system
                        </CardDescription>
                    </CardHeader>

                    {/* lecturerr add form */}
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                                        {photoPreview ? (
                                            <img
                                                src={
                                                    photoPreview ||
                                                    "/placeholder.svg"
                                                }
                                                alt="Lecturer preview"
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
                                    <div>
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
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            placeholder="Jane"
                                            required
                                        />
                                    </div>
                                    {validationError?.fullName && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.fullName}
                                            </span>
                                    )}
                                </div>

                                {/* Initials name */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="initName">
                                            Name with initials
                                        </Label>
                                        <Input
                                            id="initName"
                                            name="initName"
                                            placeholder="K.G.Fernando"
                                            required
                                        />
                                    </div>
                                    {validationError?.initName && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.initName}
                                            </span>
                                    )}
                                </div>

                                {/* reg no and nic */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="regNo">
                                            Registration Number / Staff ID
                                        </Label>
                                        <Input
                                            id="regNo"
                                            name="regNo"
                                            placeholder="STAFF2023001"
                                            required
                                            value={regNo}
                                            onChange={(e) => setRegNo(e.target.value)}
                                        />
                                        {validationError?.registerNumber && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.registerNumber}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nic">NIC Number</Label>
                                        <Input
                                            id="nic"
                                            name="nic"
                                            placeholder="6099XXXXXV"
                                            required
                                        />
                                        {validationError?.nicNo && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.nicNo}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Faculty and Position */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="faculty">Faculty</Label>
                                            <Select
                                                name="faculty"
                                                onValueChange={(val) =>
                                                    setFacultyValue(val)
                                                }
                                            >
                                                <SelectTrigger className="w-[160px]" id="faculty">
                                                    <SelectValue  placeholder="Select Faculty" />
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
                                        <div className="space-y-2">
                                            <Label htmlFor="position">
                                                Position
                                            </Label>
                                            <Select name="position">
                                                <SelectTrigger id="position" className="w-full">
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="senior">
                                                        Senior Lecturer
                                                    </SelectItem>
                                                    <SelectItem value="junior">
                                                        Junior Lecturer
                                                    </SelectItem>
                                                    <SelectItem value="demo">
                                                        Demonstrator
                                                    </SelectItem>
                                                    <SelectItem value="lecturer">
                                                        Lecturer
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {validationError?.position && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.position}
                                            </span>
                                        )}
                                        </div>
                                    </div>
                                    {/* Date Of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">
                                            Date of Birth
                                        </Label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            name="dob"
                                            max={maxDate}
                                        />
                                        {validationError?.dateOfBirth && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.dateOfBirth}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* email & phone number*/}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            placeholder="STAFF2023001@rjt.ac.lk"
                                            name="email"
                                            value={email}
                                            onChange={(e) => {
                                                // allow user to type full email; faculty selection will overwrite domain
                                                setEmail(e.target.value);
                                            }}
                                        />
                                        {validationError?.email && (
                                            <span className="text-red-500 text-sm">
                                                {validationError.email}
                                            </span>
                                        )}
                                    </div>
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Address">Address</Label>
                                    <Textarea
                                        id="Address"
                                        placeholder="Lecturer's address"
                                        name="address"
                                    />
                                    {validationError?.address && (
                                        <span className="text-red-500 text-sm">
                                            {validationError.address}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Address">Brief Bio / Specialization</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Lecturer's Specialization"
                                        name="bio"
                                    />
                                    {validationError?.bio && (
                                        <span className="text-red-500 text-sm">
                                            {validationError.bio}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href="/admin/dashboard">
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit">Add Lecturer</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
