import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Search } from "lucide-react"
import Link from "next/link"

export default function MemberManagement() {
  const members = [
    {
      id: "MEM-2023-001",
      name: "John Doe",
      email: "john.doe@example.com",
      type: "Student",
      status: "Active",
      joinDate: "2023-01-15",
      checkouts: 2
    },
    {
      id: "MEM-2023-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      type: "Faculty",
      status: "Active",
      joinDate: "2023-02-20",
      checkouts: 5
    },
    {
      id: "MEM-2023-003",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      type: "Staff",
      status: "Inactive",
      joinDate: "2023-03-10",
      checkouts: 0
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <UserPlus className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Member Management</h1>
        </div>
        <Link href="/admin/members/add">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Member
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="space-y-2">
          <Label>Search Members</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or member ID"
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkouts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.checkouts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" className="mr-2">Edit</Button>
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">3</span> members
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}