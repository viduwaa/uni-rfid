"use client";

import { useState, FormEvent, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
    role: "admin" | "lecturer" | "student" | "canteen" | "library";
}

export default function LoginForm({ role }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Get role name based on the role prop
    const roleName = useMemo(() => {
        switch (role) {
            case "admin":
                return "Admin";
            case "lecturer":
                return "Lecturer";
            case "student":
                return "Student";
            case "canteen":
                return "Canteen";
            case "library":
                return "Library";
            default:
                return "";
        }
    }, [role]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                return;
            }

            const res = await fetch("/api/auth/session");
            const session = await res.json();
            const userRole = session?.user?.role;

            console.log(userRole);

            if (!userRole) {
                setError("Unable to fetch session.");
                return;
            }

            // Map library to librarian for role checking
            const expectedRole = role === "library" ? "librarian" : role;

            if (userRole !== expectedRole) {
                setError(`You are not authorized to login as ${role}`);
                return;
            }

            // Redirect based on role
            switch (userRole) {
                case "admin":
                    router.push("/admin/dashboard");
                    break;
                case "lecturer":
                    router.push("/lecturer/dashboard");
                    break;
                case "student":
                    router.push("/student/dashboard");
                    break;
                case "canteen":
                    router.push("/canteen/dashboard");
                    break;
                case "librarian":
                    router.push("/library/dashboard");
                    break;
                default:
                    router.push("/");
            }
        } catch (err) {
            setError("An error occurred during login");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center px-4">
            {role !== "library" ? (
                <div className="flex flex-col flex-2 items-center justify-center">
                    <h1 className="text-4xl font-bold">
                        University Management System
                    </h1>
                    <h3 className="text-md mt-2">{roleName} - Portal</h3>
                </div>
            ) : (
                <></>
            )}

            <div className="flex-3 w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold capitalize">
                            {role} Login
                        </CardTitle>
                        <CardDescription>
                            Enter your credentials to access the {role}{" "}
                            dashboard.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={`${role}@university.edu`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showPassword
                                                ? "Hide password"
                                                : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            {error && (
                                <p className="text-sm text-red-500 font-medium">
                                    {error}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 mt-8">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner size="sm" />
                                        Logging in...
                                    </span>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                            <Link href="/" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    Back to Home
                                </Button>
                            </Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
