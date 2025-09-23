"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookPlus, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AddBookRequest } from "@/types/library";

export default function AddNewBooks() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddBookRequest>({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publication_year: undefined,
    category: "",
    description: "",
    location: "",
    copies: 1,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "publication_year" || id === "copies"
          ? value === ""
            ? undefined
            : parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author || formData.copies < 1) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/library/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add book");
      }

      const result = await response.json();
      toast.success(
        `Book "${formData.title}" added successfully with ${formData.copies} copies!`
      );

      // Reset form
      setFormData({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        publication_year: undefined,
        category: "",
        description: "",
        location: "",
        copies: 1,
      });

      // Optionally redirect to catalog or stay on form
      // router.push('/library/catalog-search');
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add book"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/library/dashboard");
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/library/dashboard" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <BookPlus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Add New Books</h1>
      </div>

      <Card>
        <div className="p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  placeholder="Book title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author*</Label>
                <Input
                  id="author"
                  placeholder="Author name"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  placeholder="ISBN number"
                  value={formData.isbn}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  placeholder="Publisher name"
                  value={formData.publisher || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Fiction, Science, History"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publication_year">Publication Year</Label>
                <Input
                  id="publication_year"
                  type="number"
                  placeholder="YYYY"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.publication_year || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., A1-Shelf-3"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copies">Number of Copies*</Label>
                <Input
                  id="copies"
                  type="number"
                  placeholder="Number of copies to add"
                  min="1"
                  max="50"
                  value={formData.copies}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the book"
                rows={4}
                value={formData.description || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Book...
                  </>
                ) : (
                  <>
                    <BookPlus className="mr-2 h-4 w-4" />
                    Add Book
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
