"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                setError(
                    data.message || "An error occurred. Please try again."
                );
            }
        } catch (error) {
            setError(
                "Network error. Please check your connection and try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Check Your Email
                        </CardTitle>
                        <CardDescription>
                            We've sent a password reset link to your email
                            address
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-start">
                                <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium">
                                        Email sent to: {email}
                                    </p>
                                    <p className="mt-1">
                                        Click the link in the email to reset
                                        your password. The link will expire in
                                        24 hours.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>Didn't receive the email?</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Check your spam or junk folder</li>
                                <li>
                                    Make sure you entered the correct email
                                    address
                                </li>
                                <li>
                                    Wait a few minutes for the email to arrive
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            onClick={() => {
                                setIsSubmitted(false);
                                setEmail("");
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Try Different Email
                        </Button>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">
                                Back to Home
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@university.edu"
                                className="focus-visible:ring-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <p className="text-sm text-muted-foreground">
                                Enter the email address associated with your
                                account.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={isLoading || !email.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Reset Link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                        <div className="flex items-center justify-center space-x-2 text-sm">
                            <span>Remember your password?</span>
                            <Link
                                href="/admin"
                                className="font-medium text-primary hover:underline"
                            >
                                Login
                            </Link>
                        </div>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">
                                Back to Home
                            </Button>
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
