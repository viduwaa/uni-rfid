"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IdCard, ArrowLeft, CreditCard } from "lucide-react";
import IssueNewCard from "./IssueNewCard";
import ManageExistingCard from "./ManageExistingCard";
import { UserCog } from "lucide-react";
import DeviceStatus from "@/components/DeviceStatus";
import AddMenu from "./AddMenu";

export default function RFIDManagement() {
    const [showIssueNew, setShowIssueNew] = useState(true);
    return (
        <>
            <div className="container mx-auto">
                
                <div className="p-6 space-y-6">
                    <div className="w-full grid items-center grid-cols-2 justify-around">
                        <div className="flex">
                            <Link href="/admin/dashboard" className="mr-4">
                                <Button variant="outline" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <IdCard className="h-6 w-6" />
                                    RFID Card Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Register new cards or manage existing cards
                                </p>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <DeviceStatus/>
                            
                        </div>
                    </div>
                   
                    {/* Add new | Manage Existing Card */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card
                            className={`h-full transition-all cursor-pointer hover:shadow-lg ${
                                showIssueNew
                                    ? "bg-gray-100 dark:bg-gray-900"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-900"
                            }`}
                            onClick={() => setShowIssueNew(true)}
                        >
                            <CardHeader>
                                <CreditCard className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">
                                    Issue New RFID Card
                                </CardTitle>
                                <CardDescription>
                                    Add new card to a new user
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Search by card ID or student name
                                </p>
                            </CardContent>
                        </Card>

                        <Card
                            className={`h-full transition-all cursor-pointer hover:shadow-lg ${
                                !showIssueNew
                                    ? "bg-gray-100 dark:bg-gray-900"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-900"
                            }`}
                            onClick={() => setShowIssueNew(false)}
                        >
                            <CardHeader>
                                <UserCog className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">
                                    Manage Existing Card
                                </CardTitle>
                                <CardDescription>
                                    Update or view existing card details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Search by card ID or student name
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <Card>
                        {showIssueNew ? (
                            <IssueNewCard />
                        ) : (
                            <ManageExistingCard />
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
