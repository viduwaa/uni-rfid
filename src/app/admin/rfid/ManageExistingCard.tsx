import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ManageExistingCard() {
    // Mock data - replace with actual data fetching
    const cards = [
        { id: 1, cardId: "RFID001", studentName: "John Doe", balance: 100 },
        { id: 2, cardId: "RFID002", studentName: "Jane Smith", balance: 50 },
    ];

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Manage Existing RFID Cards
            </h1>

            <div className="relative flex w-4/5 mx-auto justify-around gap-6 mb-10">
                <div className="w-full">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student name or ID..."
                        className="pl-10"
                    />
                </div>
                <Button className="block">Search</Button>
            </div>
            {cards.length > 0 ? (
                <div className="space-y-4 p-6">
                    {cards.map((card) => (
                        <div key={card.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">
                                    {card.studentName}
                                </h3>
                                <span className="text-sm bg-secondary px-3 py-1 rounded-full">
                                    Balance: ${card.balance}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Card ID: {card.cardId}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline">View Details</Button>
                                <Button variant="outline">Edit</Button>
                                <Button variant="destructive">
                                    Deactivate
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No cards found matching your search
                    </p>
                </div>
            )}
        </div>
    );
}
