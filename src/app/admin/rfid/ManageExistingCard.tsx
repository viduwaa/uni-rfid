import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    CreditCard,
    Users,
    RefreshCw,
    UserX,
    DollarSign,
    Calendar,
    Trash2,
    CheckCircle,
    XCircle,
    ArrowUpDown,
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

interface ManageExistingCardProps {
    onCardUpdated?: () => void;
}

export default function ManageExistingCard({
    onCardUpdated,
}: ManageExistingCardProps) {
    const [cards, setCards] = useState<IssuedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [sortField, setSortField] = useState<keyof IssuedCard>("full_name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Filtered and sorted cards
    const filteredCards = useMemo(() => {
        let filtered = cards;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = cards.filter(
                (card) =>
                    card.full_name?.toLowerCase().includes(query) ||
                    card.register_number?.toLowerCase().includes(query) ||
                    card.card_uid?.toLowerCase().includes(query) ||
                    card.faculty?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });

        return sorted;
    }, [cards, searchQuery, sortField, sortDirection]);

    const handleSort = (field: keyof IssuedCard) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

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
            // Notify parent to refresh stats
            onCardUpdated?.();
        } catch (error) {
            toast.error(`Failed to ${action} card`, {
                description: (error as Error).message,
            });
        }
    };

    const handleDeleteCard = async (cardUid: string, studentName: string) => {
        if (
            !confirm(
                `Are you sure you want to delete the card for ${studentName}? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/rfid/cards/${cardUid}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete card");
            }

            toast.success(`Card deleted successfully for ${studentName}`);
            refreshData();
            // Notify parent to refresh stats
            onCardUpdated?.();
        } catch (error) {
            toast.error("Failed to delete card", {
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

            {/* Cards Table */}
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
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    handleSort("full_name")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Student & Card UID
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    handleSort(
                                                        "register_number"
                                                    )
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Register No.
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    handleSort("faculty")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Faculty
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 text-right"
                                                onClick={() =>
                                                    handleSort("balance")
                                                }
                                            >
                                                <div className="flex items-center justify-end gap-2">
                                                    Balance
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    handleSort("status")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Status
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() =>
                                                    handleSort("issued_at")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    Issued Date
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCards.map((card) => (
                                            <TableRow
                                                key={card.card_uid}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-semibold">
                                                                {card.full_name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-6">
                                                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {card.card_uid}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">
                                                        {card.register_number}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {card.faculty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        {card.balance}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getStatusColor(
                                                            card.status
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {card.status ===
                                                        "ACTIVE" ? (
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                        ) : (
                                                            <XCircle className="mr-1 h-3 w-3" />
                                                        )}
                                                        {card.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            card.issued_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {card.status ===
                                                        "ACTIVE" ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
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
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                onClick={() =>
                                                                    handleCardAction(
                                                                        "activate",
                                                                        card.card_uid,
                                                                        card.full_name
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Activate
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() =>
                                                                handleDeleteCard(
                                                                    card.card_uid,
                                                                    card.full_name
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
