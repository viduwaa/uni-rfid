import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { History, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TransactionHistory() {
  const transactions = [
    { id: 'TXN-001', date: '2023-06-15 10:30', student: 'John Doe', amount: 5.50, items: 'Chicken Rice, Juice' },
    { id: 'TXN-002', date: '2023-06-15 11:15', student: 'Jane Smith', amount: 3.00, items: 'Sandwich' },
    { id: 'TXN-003', date: '2023-06-15 12:45', student: 'Robert Johnson', amount: 7.50, items: 'Fried Noodles, Ice Cream' },
    { id: 'TXN-004', date: '2023-06-14 09:20', student: 'Emily Davis', amount: 2.50, items: 'Mineral Water, Snack' },
    { id: 'TXN-005', date: '2023-06-14 13:10', student: 'Michael Brown', amount: 4.00, items: 'Sandwich, Juice' },
  ]

  return (
    <div className="container mx-auto py-8 px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Transaction History</h1>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input placeholder="Filter by student name..." className="max-w-sm" />
            <Button variant="outline">Today</Button>
            <Button variant="outline">This Week</Button>
            <Button variant="outline">This Month</Button>
            <Button>Apply Filters</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">{txn.id}</TableCell>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell>{txn.student}</TableCell>
                  <TableCell>{txn.items}</TableCell>
                  <TableCell className="text-right">${txn.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing 1 to 5 of 5 transactions
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="outline" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}