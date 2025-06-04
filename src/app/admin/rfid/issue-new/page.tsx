import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function IssueNewCard() {
  // Mock data - replace with actual data fetching
  const students = [
    { id: 1, name: "John Doe", studentId: "STU001" },
    { id: 2, name: "Jane Smith", studentId: "STU002" },
  ]

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center m-auto">Issue New RFID Card</h1>
        <Link href="/admin/students/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Student
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4 ">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or ID..."
            className="pl-10"
          />
        </div>
        <Button>Search</Button>
      </div>

      {students.length > 0 ? (
        <div className="space-y-4 px-6">
          {students.map(student => (
            <div key={student.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.studentId}</p>
              </div>
              <Button>Issue Card</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No students found</p>
          <Link href="/admin/students/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}