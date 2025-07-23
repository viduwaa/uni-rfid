import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { BaseStudent } from "@/types/student";

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

type WriteStatus = "idle" | "writing" | "success" | "error";

export function useWriteToCard(cardData: BaseStudent | null) {
    const [status, setStatus] = useState<WriteStatus>("idle");
    const [cardUID, setCardUID] = useState<string | null>(null);
    const [error, setError] = useState<any>(null);
    const socketRef = useRef<Socket | null>(null);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (!cardData) return;

        setStatus("writing");
        setCardUID(null);
        setError(null);

        const socket = io(SOCKET_SERVER_URL, {
            autoConnect: true,
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.emit("write-to-card", cardData);

        socket.on("card-write-success", (result) => {
            setStatus("success");
            setCardUID(result.uid);
            setMsg("\n"+
                result.student.register_number +
                    "\n" +
                    result.student.full_name +
                    "\n" +
                    result.student.faculty
            );
            socket.disconnect();
        });

        socket.on("card-write-failed", (result) => {
            setStatus("error");
            setError(result.error);
            socket.disconnect();
        });

        // Fallback timeout (e.g., 10s) in case nothing comes back
        const timeout = setTimeout(() => {
            if (status === "writing") {
                setStatus("error");
                setError("Timeout: No response from card writer.");
                socket.disconnect();
            }
        }, 10000);

        return () => {
            clearTimeout(timeout);
            socket.off("card-write-success");
            socket.off("card-write-failed");
            socket.disconnect();
        };
    }, [cardData]);

    return { status, cardUID, error, msg };
}
