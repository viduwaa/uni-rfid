"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import formatCurrency from "@/lib/formatCurrency";

interface StudentData {
  user_id: string;
  register_number: string;
  full_name: string;
  email: string;
  faculty: string;
  year_of_study: number;
  card_uid: string;
  balance: number;
  card_status: string;
}

interface LibraryMemberData extends StudentData {
  membership_id: string;
  membership_status: string;
  max_books_allowed: number;
  current_loans: number;
  overdue_loans: number;
  pending_fines: number;
}

interface RFIDStudentReaderProps {
  onStudentVerified: (student: LibraryMemberData | null) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

export default function RFIDStudentReader({
  onStudentVerified,
  onError,
  disabled = false,
}: RFIDStudentReaderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nfcStatus, setNfcStatus] = useState({
    status: "disconnected",
    reader: null,
    error: null,
  });
  const [studentData, setStudentData] = useState<LibraryMemberData | null>(
    null
  );
  const [waitingForCard, setWaitingForCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEffect(() => {
    if (disabled) return;

    // Initialize Socket.IO connection
    const newSocket = io(SOCKET_SERVER_URL);

    newSocket.on("connect", () => {
      console.log("Connected to NFC server");
      setEventLog((prev) => [...prev, "🔌 Connected to NFC server"]);
      // Request current NFC status
      newSocket.emit("get-nfc-status");
    });

    newSocket.on("nfc-reader-status", (status) => {
      console.log("NFC Status:", status);
      setNfcStatus(status);
      setEventLog((prev) => [
        ...prev,
        `📶 NFC Status: ${status.status} - ${status.reader || "No reader"}`,
      ]);
    });

    newSocket.on("nfc-swipe", (cardData) => {
      console.log("Card detected:", cardData);
      setEventLog((prev) => [...prev, `📱 Card detected: ${cardData.uid}`]);
      fetchStudentData(cardData.uid);
    });

    newSocket.on("nfc-swipe-end", () => {
      console.log("Card removed");
      setEventLog((prev) => [...prev, "📤 Card removed"]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [disabled]);

  const fetchStudentData = async (cardUid: string) => {
    setIsProcessing(true);
    setEventLog((prev) => [...prev, `🔍 Looking up student: ${cardUid}`]);

    try {
      const response = await fetch(`/api/library/student-lookup/${cardUid}`);

      if (!response.ok) {
        throw new Error("Student not found or not a library member");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setStudentData(result.data);
        setEventLog((prev) => [
          ...prev,
          `👤 Student found: ${result.data.full_name}`,
          `📚 Library Status: ${result.data.membership_status}`,
          `📖 Current loans: ${result.data.current_loans}/${result.data.max_books_allowed}`,
        ]);
        onStudentVerified(result.data);
      } else {
        throw new Error(result.message || "Student lookup failed");
      }
    } catch (error) {
      console.error("Student lookup error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Student lookup failed";
      setEventLog((prev) => [...prev, `❌ Error: ${errorMessage}`]);
      setStudentData(null);
      onStudentVerified(null);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearData = () => {
    setStudentData(null);
    setEventLog([]);
    onStudentVerified(null);
  };

  const startReading = () => {
    if (disabled) return;
    setWaitingForCard(true);
    setEventLog((prev) => [...prev, "⏳ Waiting for student card..."]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          RFID Student Verification
          <Badge
            variant={
              nfcStatus.status === "connected" ? "default" : "destructive"
            }
          >
            {nfcStatus.status}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* NFC Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Reader: {nfcStatus.reader || "None"}
          </span>

          <div className="flex gap-2">
            <Button
              onClick={startReading}
              disabled={
                disabled ||
                nfcStatus.status !== "connected" ||
                waitingForCard ||
                isProcessing
              }
              size="sm"
            >
              {waitingForCard || isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isProcessing ? "Processing..." : "Waiting..."}
                </>
              ) : (
                "Start Reading"
              )}
            </Button>

            <Button
              onClick={clearData}
              variant="outline"
              size="sm"
              disabled={disabled}
            >
              Clear
            </Button>
          </div>
        </div>

        <Separator />

        {/* Student Information */}
        {studentData && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Student Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Name:</div>
                  <div className="text-muted-foreground">
                    {studentData.full_name}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Student ID:</div>
                  <div className="text-muted-foreground">
                    {studentData.register_number}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Faculty:</div>
                  <div className="text-muted-foreground">
                    {studentData.faculty}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Year:</div>
                  <div className="text-muted-foreground">
                    Year {studentData.year_of_study}
                  </div>
                </div>
              </div>
            </div>

            {/* Library Membership Status */}
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Library Membership
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Status:</div>
                  <Badge
                    className={getStatusColor(studentData.membership_status)}
                  >
                    {studentData.membership_status}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium">Books Allowed:</div>
                  <div className="text-muted-foreground">
                    {studentData.max_books_allowed}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Current Loans:</div>
                  <div
                    className={
                      studentData.current_loans > 0
                        ? "text-blue-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {studentData.current_loans}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Overdue Books:</div>
                  <div
                    className={
                      studentData.overdue_loans > 0
                        ? "text-red-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {studentData.overdue_loans}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {studentData.overdue_loans > 0 && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 rounded border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">
                      {studentData.overdue_loans} overdue book(s) - Return
                      required before new checkout
                    </span>
                  </div>
                </div>
              )}

              {studentData.pending_fines > 0 && (
                <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900 rounded border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">
                      Pending fines: {formatCurrency(studentData.pending_fines)}
                    </span>
                  </div>
                </div>
              )}

              {studentData.membership_status !== "active" && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 rounded border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">
                      Membership is {studentData.membership_status} - Contact
                      library administration
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border">
          <h4 className="font-semibold text-sm mb-2">📋 Activity Log</h4>
          <div className="text-xs max-h-32 overflow-y-auto space-y-1">
            {eventLog.length === 0 ? (
              <p className="text-muted-foreground">No activity yet...</p>
            ) : (
              eventLog.slice(-10).map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
