import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BaseStudent } from "@/types/student";
import AddMenu from "./AddMenu";

export default function IssueNewCard() {
    const [students, setStudents] = useState<BaseStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectData, setSelectData] = useState<BaseStudent | null>(null);
    const [view, setView] = useState(false);


    useEffect(() => {
        const fetchStudents = async () => {
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
                    description:
                        (error as Error).message + "\nPlease try again",
                });
                setStudents([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Show loading state
    if (loading) {
        return (
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-center m-auto">
                        Issue New RFID Card
                    </h1>
                </div>
                <div className="w-full flex items-center justify-center">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative container mx-auto">
                <div className="absolute -top-6 w-full">
                    {view && selectData && (
                        <AddMenu
                            studentData={selectData}
                            onClose={() => setView(false)}
                        />
                    )}
                </div>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-center m-auto">
                        Issue New RFID Card
                    </h1>
                </div>

                <div className="flex w-4/5 mx-auto justify-around gap-6 mb-10">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name or ID..."
                            className="pl-10"
                        />
                    </div>
                    <Button className="block">Search</Button>
                </div>

                {students.length > 0 ? (
                    <div className="space-y-4 px-6 w-3/4 mx-auto">
                        {students.map((student) => (
                            <div
                                key={student.register_number}
                                className="border rounded-lg p-4 flex justify-between items-center hover:border-2 transition-all"
                            >
                                <div>
                                    <h3 className="font-medium">
                                        {student.full_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {student.register_number}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setView(!view);
                                        setSelectData(student);
                                    }}
                                >
                                    Issue Card
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No students without cards found
                        </p>
                        <Link href="/admin/students/add">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Student
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
