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
                    <div className="w-full grid items-center grid-cols-3 gap-4">
                        <div className="flex items-center">
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
                                    Modern card management system
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        showIssueNew ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setShowIssueNew(true)}
                                    className="flex items-center gap-1"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Issue New
                                </Button>
                                <Button
                                    variant={
                                        !showIssueNew ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setShowIssueNew(false)}
                                    className="flex items-center gap-1"
                                >
                                    <UserCog className="h-4 w-4" />
                                    Manage Existing
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <DeviceStatus />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="flex items-center p-4">
                                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold">--</p>
                                    <p className="text-xs text-muted-foreground">
                                        Active Cards
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center p-4">
                                <UserCog className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold">--</p>
                                    <p className="text-xs text-muted-foreground">
                                        Pending Issues
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center p-4">
                                <IdCard className="h-8 w-8 text-orange-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold">--</p>
                                    <p className="text-xs text-muted-foreground">
                                        Total Balance
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center p-4">
                                <UserCog className="h-8 w-8 text-purple-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-bold">--</p>
                                    <p className="text-xs text-muted-foreground">
                                        Recent Activity
                                    </p>
                                </div>
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
