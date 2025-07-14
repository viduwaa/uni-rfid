import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookPlus } from "lucide-react"

export default function AddNewBooks() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <BookPlus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Add New Books</h1>
      </div>

      <div className=" p-6 rounded-lg shadow-md">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input id="title" placeholder="Book title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author*</Label>
              <Input id="author" placeholder="Author name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN*</Label>
              <Input id="isbn" placeholder="ISBN number" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input id="publisher" placeholder="Publisher name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Category" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication-year">Publication Year</Label>
              <Input id="publication-year" type="number" placeholder="YYYY" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copies">Number of Copies*</Label>
              <Input id="copies" type="number" defaultValue="1" min="1" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Shelf location" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Book description" rows={4} />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">
              <BookPlus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}