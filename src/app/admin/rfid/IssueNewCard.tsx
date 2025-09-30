import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Users, CreditCard, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { BaseStudent } from "@/types/student";
import AddMenu from "./AddMenu";

export default function IssueNewCard() {
    const [students, setStudents] = useState<BaseStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectData, setSelectData] = useState<BaseStudent | null>(null);
    const [view, setView] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Filtered students based on search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;

        const query = searchQuery.toLowerCase().trim();
        return students.filter(
            (student) =>
                student.full_name?.toLowerCase().includes(query) ||
                student.register_number?.toLowerCase().includes(query) ||
                student.faculty?.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/students?notissued=true");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Retrieving Error");
            }

            // Handle successful response
            if (data.success) {
                setStudents(data.data);
                toast.success(`Found ${data.count} students without cards`);
            } else {
                throw new Error(data.message || "Failed to fetch students");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching students", {
                description: (error as Error).message + "\nPlease try again",
            });
            setStudents([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await fetchStudents();
        setRefreshing(false);
        toast.success("Data refreshed");
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCardIssued = () => {
        // Refresh the list after successful card issue
        refreshData();
        setView(false);
        setSelectData(null);
    };

    return (
        <>
            <div className="relative container mx-auto p-8">
                {/* Modal Overlay */}
                <div className="absolute -top-6 w-full z-50">
                    {view && selectData && (
                        <AddMenu
                            studentData={selectData}
                            onClose={() => setView(false)}
                            onSuccess={handleCardIssued}
                        />
                    )}
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-6 ">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">
                                Issue New RFID Card
                            </h1>
                            <p className="text-muted-foreground">
                                Select a student to issue a new card
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <Users className="h-3 w-3" />
                            {students.length} students
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
                                    placeholder="Search by name, register number, or faculty..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
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
                                Showing {filteredStudents.length} of{" "}
                                {students.length} students
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
                                <span>Loading students...</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Students List */}
                {!loading && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Students Without Cards
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredStudents.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredStudents.map((student) => (
                                        <div
                                            key={student.register_number}
                                            className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">
                                                    {student.full_name}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        📋{" "}
                                                        {
                                                            student.register_number
                                                        }
                                                    </p>
                                                    <Badge variant="outline">
                                                        {student.faculty}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setView(true);
                                                    setSelectData(student);
                                                }}
                                                className="ml-4"
                                            >
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Issue Card
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery ? (
                                <div className="text-center py-8">
                                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-2">
                                        No students found matching "
                                        {searchQuery}"
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
                                    <p className="text-muted-foreground mb-4">
                                        All students have been issued cards
                                    </p>
                                    <Link href="/admin/students/add">
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add New Student
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
