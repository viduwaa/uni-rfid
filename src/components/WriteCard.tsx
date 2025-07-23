import { useEffect, useState } from "react";
import { useWriteToCard } from "@/hooks/useWritetoCard";
import { BaseStudent } from "@/types/student";

export default function WriteCardComponent({
    student,
    isWriting,
}: {
    student: BaseStudent;
    isWriting: boolean;
}) {
    const [triggerWrite, setTriggerWrite] = useState(false);
    const [eventLog, setEventLog] = useState<string[]>([]);

    // Handle trigger only when isWriting becomes true
    useEffect(() => {
        if (isWriting) {
            setTriggerWrite(true);
            setEventLog(["🟢 Starting write process..."]);
        }
    }, [isWriting]);

    const { status, cardUID, error , msg} = useWriteToCard(
        triggerWrite ? student : null
    );

    // Log status updates
    useEffect(() => {
        if (!triggerWrite) return;

        if (status === "idle") {
            setEventLog((prev) => [...prev, "⌛ Preparing to write..."]);
        } else if (status === "writing") {
            setEventLog((prev) => [
                ...prev,
                "✍️ Writing to card. Please tap it...",
            ]);
        } else if (status === "success") {
            setEventLog((prev) => [
                ...prev,
                `✅ Successfully written! UID: ${cardUID}`,
                `Data written: ${msg}`
            ]);
            setTriggerWrite(false); // prevent re-write
        } else if (status === "error") {
            setEventLog((prev) => [
                ...prev,
                `❌ Failed to write card: ${JSON.stringify(error)}`,
            ]);
            setTriggerWrite(false);
        }
    }, [status]);

    return (
        <div className="  p-2 mt-4">
            <p className="font-semibold text-sm border-b-1 pb-2">
                🧾 Write Log:
            </p>
            <div className="p-3 rounded text-sm max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                    {eventLog.map((log, index) => (
                        <li key={index}>{log}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
