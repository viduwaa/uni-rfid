import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BaseStudent } from "@/types/student";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

type WriteStatus = "idle" | "writing" | "success" | "error";

export function useWriteToCard(cardData: BaseStudent | null) {
  const [status, setStatus] = useState<WriteStatus>("idle");
  const [cardUID, setCardUID] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!cardData) return;

    const socket = io(SOCKET_SERVER_URL);
    setStatus("writing");
    setCardUID(null);
    setError(null);

    socket.emit("write-to-card", cardData);

    socket.on("card-write-success", (result) => {
      setStatus("success");
      setCardUID(result.card_uid);
      socket.disconnect();
    });

    socket.on("write-error", (err) => {
      setStatus("error");
      setError(err);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [cardData]);

  return { status, cardUID, error };
}
