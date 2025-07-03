import { useWriteToCard } from "@/hooks/useWritetoCard";
import { BaseStudent } from "@/types/student";

export default function WriteCardComponent({ student }: { student: BaseStudent }) {
  const { status, cardUID, error } = useWriteToCard(student);

  return (
    <div className="text-center mt-6">
      {status === "idle" && <p>Ready to write card...</p>}
      {status === "writing" && <p>⏳ Writing to card, please tap it...</p>}
      {status === "success" && (
        <p className="text-green-600">✅ Card written! UID: {cardUID}</p>
      )}
      {status === "error" && (
        <p className="text-red-600">❌ Error writing card: {JSON.stringify(error)}</p>
      )}
    </div>
  );
}
