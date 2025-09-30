import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    CreditCard,
    Users,
    RefreshCw,
    Eye,
    Edit,
    UserX,
    DollarSign,
    Calendar,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

interface IssuedCard {
    user_id: string;
    full_name: string;
    register_number: string;
    faculty: string;
    card_uid: string;
    balance: number;
    status: "ACTIVE" | "INACTIVE" | "BLOCKED";
    issued_at: string;
    last_used?: string;
}

export default function ManageExistingCard() {
    const [cards, setCards] = useState<IssuedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Filtered cards based on search query
    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return cards;

        const query = searchQuery.toLowerCase().trim();
        return cards.filter(
            (card) =>
                card.full_name?.toLowerCase().includes(query) ||
                card.register_number?.toLowerCase().includes(query) ||
                card.card_uid?.toLowerCase().includes(query) ||
                card.faculty?.toLowerCase().includes(query)
        );
    }, [cards, searchQuery]);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/rfid/cards?issued=true");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch cards");
            }

            if (data.success) {
                setCards(data.data || []);
                toast.success(`Found ${data.data?.length || 0} issued cards`);
            } else {
                throw new Error(data.message || "Failed to fetch cards");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching cards", {
                description: (error as Error).message,
            });
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await fetchCards();
        setRefreshing(false);
        toast.success("Data refreshed");
    };

    const handleCardAction = async (
        action: string,
        cardUid: string,
        studentName: string
    ) => {
        try {
            const response = await fetch(`/api/rfid/cards/${cardUid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action} card`);
            }

            toast.success(`Card ${action}d successfully for ${studentName}`);
            refreshData();
        } catch (error) {
            toast.error(`Failed to ${action} card`, {
                description: (error as Error).message,
            });
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-green-100 text-green-800 border-green-200";
            case "INACTIVE":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "BLOCKED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="container mx-auto p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 ">
                <div className="flex items-center gap-3">
                    <UserX className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">
                            Manage Existing Cards
                        </h1>
                        <p className="text-muted-foreground">
                            View and manage issued RFID cards
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                    >
                        <CreditCard className="h-3 w-3" />
                        {cards.length} cards
                    </Badge>
                    <Button
                        onClick={refreshData}
                        variant="outline"
                        size="sm"
                        disabled={refreshing}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, register number, card UID, or faculty..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {searchQuery && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            Showing {filteredCards.length} of {cards.length}{" "}
                            cards
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading cards...</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cards List */}
            {!loading && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Issued RFID Cards
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredCards.length > 0 ? (
                            <div className="space-y-4">
                                {filteredCards.map((card) => (
                                    <div
                                        key={card.card_uid}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {card.full_name}
                                                    </h3>
                                                    <Badge
                                                        className={getStatusColor(
                                                            card.status
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {card.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        <span>
                                                            {
                                                                card.register_number
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3" />
                                                        <span>
                                                            {card.card_uid}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>
                                                            Rs.
                                                            {card.balance}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {new Date(
                                                                card.issued_at
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Badge
                                                    variant="outline"
                                                    className="mt-2"
                                                >
                                                    {card.faculty}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // Handle view details
                                                    toast.info(
                                                        "View details feature coming soon"
                                                    );
                                                }}
                                            >
                                                <Eye className="mr-1 h-3 w-3" />
                                                Details
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // Handle edit
                                                    toast.info(
                                                        "Edit feature coming soon"
                                                    );
                                                }}
                                            >
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>

                                            {card.status === "ACTIVE" ? (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleCardAction(
                                                            "deactivate",
                                                            card.card_uid,
                                                            card.full_name
                                                        )
                                                    }
                                                >
                                                    <UserX className="mr-1 h-3 w-3" />
                                                    Deactivate
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleCardAction(
                                                            "activate",
                                                            card.card_uid,
                                                            card.full_name
                                                        )
                                                    }
                                                >
                                                    <CreditCard className="mr-1 h-3 w-3" />
                                                    Activate
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchQuery ? (
                            <div className="text-center py-8">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-2">
                                    No cards found matching "{searchQuery}"
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear Search
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No RFID cards have been issued yet
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
