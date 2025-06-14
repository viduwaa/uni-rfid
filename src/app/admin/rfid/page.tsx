"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
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
} from "@/components/ui/table"
import { 
  IdCard, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft
} from "lucide-react";


import { Smartphone, UserCog } from "lucide-react"

export default function RFIDManagement() {
  return (

    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link href="/admin/dashboard" className="mr-4">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <IdCard className="h-6 w-6" />
            RFID Card Management
          </h1>
          <p className="text-muted-foreground">
            Register new cards or manage existing cards
          </p>
        </div>

        {/* Issue New Card */}
        <Button asChild>
          <Link href="/admin/rfid/issue-new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Register New Card
          </Link>
        </Button>
      </div>

        {/* Manage Existing Card */}
        <Link href="/admin/rfid/manage-existing">
          <Card className="h-full transition-all hover:shadow-lg">
            <CardHeader>
              <UserCog className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Manage Existing Card</CardTitle>
              <CardDescription>Update or view existing card details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Search by card ID or student name
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    
  )
}