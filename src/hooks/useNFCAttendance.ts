"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface NFCReaderStatus {
    status: "connected" | "disconnected" | "error";
    reader: string | null;
    timestamp: number;
    error: string | null;
}

interface NFCSwipeData {
    uid: string;
    reader: string;
    timestamp: number;
    error: string | null;
    data: {
        register_number: string;
        name: string;
        faculty_name: string;
    } | null;
}

interface UseNFCAttendanceProps {
    courseId: string | null;
    onAttendanceRecorded?: (data: any) => void;
    isSessionActive: boolean;
}

export function useNFCAttendance({
    courseId,
    onAttendanceRecorded,
    isSessionActive,
}: UseNFCAttendanceProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState<NFCReaderStatus>({
        status: "disconnected",
        reader: null,
        timestamp: Date.now(),
        error: null,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSwipeTime, setLastSwipeTime] = useState(0);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io("http://localhost:4000", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("✅ Connected to NFC socket server");
            // Request current NFC status
            newSocket.emit("get-nfc-status");
        });

        newSocket.on("disconnect", (reason) => {
            console.log("❌ Disconnected from socket server:", reason);
            toast.error("NFC connection lost. Attempting to reconnect...");
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
            toast.error("Failed to connect to NFC service");
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Handle NFC reader status updates
    useEffect(() => {
        if (!socket) return;

        const handleReaderStatus = (status: NFCReaderStatus) => {
            console.log("📡 NFC Reader status update:", status);
            setNfcStatus(status);

            if (status.status === "connected" && status.reader) {
                toast.success(`NFC Reader connected: ${status.reader}`);
            } else if (status.status === "disconnected") {
                toast.warning("NFC Reader disconnected");
            } else if (status.status === "error" && status.error) {
                toast.error(`NFC Error: ${status.error}`);
            }
        };

        socket.on("nfc-reader-status", handleReaderStatus);

        return () => {
            socket.off("nfc-reader-status", handleReaderStatus);
        };
    }, [socket]);

    // Handle NFC card swipes
    useEffect(() => {
        if (!socket || !isSessionActive || !courseId) return;

        const handleCardSwipe = async (swipeData: NFCSwipeData) => {
            console.log("💳 Card swiped:", swipeData);

            // Prevent duplicate processing of the same card within 5 seconds
            const now = Date.now();
            if (now - lastSwipeTime < 5000 && isProcessing) {
                console.log("⚠️ Duplicate swipe detected, ignoring...");
                return;
            }

            setLastSwipeTime(now);
            setIsProcessing(true);

            // Clear any existing timeout
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }

            try {
                if (!swipeData.data || !swipeData.data.register_number) {
                    throw new Error(
                        "Invalid card data - no student information found"
                    );
                }

                const { register_number, name, faculty_name } = swipeData.data;

                // Show processing toast
                const processingToast = toast.loading(
                    `Processing attendance for ${name} (${register_number})`
                );

                // Record attendance via API
                const response = await fetch("/api/lecturer/attendance/nfc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cardUid: swipeData.uid,
                        registerNumber: register_number,
                        courseId: courseId,
                        readerName: swipeData.reader,
                        timestamp: swipeData.timestamp,
                    }),
                });

                const result = await response.json();

                // Dismiss processing toast
                toast.dismiss(processingToast);

                if (result.success) {
                    toast.success(
                        `✅ Attendance recorded: ${result.student.full_name}`,
                        {
                            description: `Register: ${result.student.register_number} - ${new Date().toLocaleTimeString()}`,
                            duration: 4000,
                        }
                    );

                    // Trigger callback for real-time updates
                    if (onAttendanceRecorded) {
                        onAttendanceRecorded(result);
                    }
                } else {
                    // Handle specific error cases
                    if (result.code === "ALREADY_RECORDED") {
                        toast.warning(
                            `⚠️ ${result.student?.full_name || register_number} already marked present today`,
                            {
                                description: `Last recorded: ${result.lastRecorded ? new Date(result.lastRecorded).toLocaleTimeString() : "Earlier today"}`,
                            }
                        );
                    } else if (result.code === "STUDENT_NOT_FOUND") {
                        toast.error(
                            `❌ Student not found: ${register_number}`,
                            {
                                description:
                                    "Card may not be properly registered",
                            }
                        );
                    } else if (result.code === "NOT_ENROLLED") {
                        toast.error(
                            `❌ ${result.student?.full_name || register_number} not enrolled in this course`,
                            {
                                description:
                                    "Student is not registered for the selected course",
                            }
                        );
                    } else {
                        toast.error(
                            `❌ Failed to record attendance: ${result.message}`
                        );
                    }
                }
            } catch (error) {
                console.error("❌ Error processing card swipe:", error);
                toast.error("❌ Error processing card swipe", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Unknown error occurred",
                });
            } finally {
                // Set timeout to reset processing state
                processingTimeoutRef.current = setTimeout(() => {
                    setIsProcessing(false);
                }, 2000);
            }
        };

        const handleCardRemoved = (data: { uid: string }) => {
            console.log("👋 Card removed:", data.uid);
            // Optional: Add visual feedback when card is removed
        };

        socket.on("nfc-swipe", handleCardSwipe);
        socket.on("nfc-swipe-end", handleCardRemoved);

        return () => {
            socket.off("nfc-swipe", handleCardSwipe);
            socket.off("nfc-swipe-end", handleCardRemoved);
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, [
        socket,
        isSessionActive,
        courseId,
        lastSwipeTime,
        isProcessing,
        onAttendanceRecorded,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, []);

    const requestNFCStatus = () => {
        if (socket) {
            socket.emit("get-nfc-status");
        }
    };

    return {
        nfcStatus,
        isProcessing,
        socket,
        requestNFCStatus,
        isConnected: socket?.connected || false,
    };
}
