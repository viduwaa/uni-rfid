import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookMarked, Search } from "lucide-react"

export default function BookReturns() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <BookMarked className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Book Returns</h1>
      </div>

      <div className="p-6 rounded-lg shadow-md space-y-6">
        <div className="space-y-2">
          <Label>Scan Book Barcode</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Scan or enter book barcode"
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Book Information</h2>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input disabled value="Advanced Mathematics" />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input disabled value="Robert Johnson" />
            </div>
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input disabled value="LIB-0042" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Loan Information</h2>
            <div className="space-y-2">
              <Label>Checked Out By</Label>
              <Input disabled value="Sarah Williams (MEM-2023-005)" />
            </div>
            <div className="space-y-2">
              <Label>Checkout Date</Label>
              <Input disabled value="May 20, 2023" />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input disabled value="June 3, 2023" />
            </div>
            <div className="space-y-2">
              <Label>Days Overdue</Label>
              <Input disabled value="12 days" />
            </div>
            <div className="space-y-2">
              <Label>Late Fee</Label>
              <Input disabled value="$6.00" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Waive Fee</Button>
          <Button>
            <BookMarked className="mr-2 h-4 w-4" />
            Process Return
          </Button>
        </div>
      </div>
    </div>
  )
}