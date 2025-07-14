import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LibraryReports() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Library Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Circulation Statistics</CardTitle>
            <CardDescription>Current month's checkouts and returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Books Checked Out</span>
                <span className="font-medium">142</span>
              </div>
              <div className="flex justify-between">
                <span>Books Returned</span>
                <span className="font-medium">118</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue Books</span>
                <span className="font-medium text-red-600">24</span>
              </div>
              <div className="flex justify-between">
                <span>New Members</span>
                <span className="font-medium">15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current book inventory metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Books</span>
                <span className="font-medium">5,214</span>
              </div>
              <div className="flex justify-between">
                <span>Available for Checkout</span>
                <span className="font-medium">3,892</span>
              </div>
              <div className="flex justify-between">
                <span>Currently Checked Out</span>
                <span className="font-medium">1,322</span>
              </div>
              <div className="flex justify-between">
                <span>Lost/Damaged</span>
                <span className="font-medium text-red-600">42</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fines Collected</CardTitle>
            <CardDescription>Financial transactions this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Fines Assessed</span>
                <span className="font-medium">$286.50</span>
              </div>
              <div className="flex justify-between">
                <span>Fines Collected</span>
                <span className="font-medium">$214.00</span>
              </div>
              <div className="flex justify-between">
                <span>Fines Waived</span>
                <span className="font-medium">$42.50</span>
              </div>
              <div className="flex justify-between">
                <span>Outstanding Fines</span>
                <span className="font-medium text-red-600">$30.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Books</CardTitle>
            <CardDescription>Most frequently checked out books</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>1. Introduction to Computer Science</span>
                <span className="font-medium">28 checkouts</span>
              </div>
              <div className="flex justify-between">
                <span>2. Modern Physics</span>
                <span className="font-medium">22 checkouts</span>
              </div>
              <div className="flex justify-between">
                <span>3. Advanced Mathematics</span>
                <span className="font-medium">19 checkouts</span>
              </div>
              <div className="flex justify-between">
                <span>4. The Great Novel</span>
                <span className="font-medium">15 checkouts</span>
              </div>
              <div className="flex justify-between">
                <span>5. Chemistry Fundamentals</span>
                <span className="font-medium">12 checkouts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">
            Export as CSV
          </Button>
          <Button>
            Generate Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}