import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSearch, Search } from "lucide-react";
import Link from "next/link"

export default function CatalogSearch() {
  const books = [
    {
      id: "BK-001",
      title: "Introduction to Computer Science",
      author: "Jane Smith",
      isbn: "978-0123456789",
      available: 3,
      total: 5,
      location: "Shelf A1",
    },
    {
      id: "BK-002",
      title: "Advanced Mathematics",
      author: "Robert Johnson",
      isbn: "978-9876543210",
      available: 1,
      total: 2,
      location: "Shelf B2",
    },
    {
      id: "BK-003",
      title: "Modern Physics",
      author: "Emily Davis",
      isbn: "978-5432109876",
      available: 0,
      total: 3,
      location: "Shelf C3",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <FileSearch className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Catalog Search</h1>
      </div>

      <div className="p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Search by Title</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Book title" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Search by Author</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Author name" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Search by ISBN</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ISBN number" className="pl-10" />
            </div>
          </div>
        </div>

        <Button className="w-full md:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Search Catalog
        </Button>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Search Results (3 books found)
          </h2>
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {book.author}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      book.available > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.available > 0
                      ? `${book.available} available`
                      : "Checked out"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Book ID</p>
                    <p>{book.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ISBN</p>
                    <p>{book.isbn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Copies</p>
                    <p>{book.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p>{book.location}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Link
                    href={`/admin/library/book-checkout?bookId=${book.id}`}
                    passHref
                  >
                    <Button size="sm" disabled={book.available === 0}>
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
