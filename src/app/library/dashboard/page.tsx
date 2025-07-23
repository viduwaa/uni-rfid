import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookPlus,
  BookOpenCheck,
  BookMarked,
  UserPlus,
  Users,
  LibraryBig,
  FileSearch,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function LibraryDashboard() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10 p-6 space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Library Management System
          </h1>
          <p className="mt-2 text-muted-foreground text-center">
            Comprehensive tools for library administration
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
          {/* Book Management */}
          <Link href="./book-add/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <BookPlus className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Add New Books</CardTitle>
                <CardDescription>
                  Catalog new books into the library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add book details including title, author, ISBN, and category
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Book Checkout */}
          <Link href="./book-checkout/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <BookOpenCheck className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Book Checkout</CardTitle>
                <CardDescription>
                  Manage book lending process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Check out books to students and faculty members
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Book Returns */}
          <Link href="./book-returns" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <BookMarked className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Book Returns</CardTitle>
                <CardDescription>
                  Process returned books and manage fines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record book returns and calculate overdue fines
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Member Management */}
          <Link href="./member-management/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <UserPlus className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Member Management</CardTitle>
                <CardDescription>
                  Manage library memberships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Register and manage students, faculty, and staff members
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Catalog Search */}
          <Link href="./catalog-search/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <FileSearch className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Catalog Search</CardTitle>
                <CardDescription>
                  Search the entire library collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced search by title, author, subject, or ISBN
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Reports */}
          <Link href="./reports/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Library Reports</CardTitle>
                <CardDescription>
                  Generate library usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Circulation reports, overdue books, and inventory status
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 flex justify-end px-5">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}