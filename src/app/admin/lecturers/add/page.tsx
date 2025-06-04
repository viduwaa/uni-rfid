"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Upload, ArrowLeft } from "lucide-react"

export default function AddLecturer() {
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true)

      // Simulate upload delay
      setTimeout(() => {
        const file = e.target.files![0]
        const reader = new FileReader()

        reader.onload = (event) => {
          setPhotoPreview(event.target?.result as string)
          setIsUploading(false)
        }

        reader.readAsDataURL(file)
      }, 1000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate form submission
    toast.success("Lecturer Added", {
      description: "The lecturer has been successfully added to the system.",
    })
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/admin/dashboard" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-center w-full mt-4">Add New Lecturer</h1>
        </div>

        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Lecturer Information</CardTitle>
            <CardDescription>Enter the details of the new lecturer to register them in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                    {photoPreview ? (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Lecturer preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="photo"
                      className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Upload Photo
                    </Label>
                    <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Jane" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Smith" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input id="staffId" placeholder="STAFF2023001" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jane.smith@university.edu" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="eng">Engineering</SelectItem>
                        <SelectItem value="bus">Business</SelectItem>
                        <SelectItem value="arts">Arts & Humanities</SelectItem>
                        <SelectItem value="sci">Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select>
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="associate">Associate Professor</SelectItem>
                        <SelectItem value="assistant">Assistant Professor</SelectItem>
                        <SelectItem value="lecturer">Lecturer</SelectItem>
                        <SelectItem value="adjunct">Adjunct Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" placeholder="e.g., Machine Learning, Organic Chemistry" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="office">Office Location</Label>
                    <Input id="office" placeholder="Building A, Room 101" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Brief Bio</Label>
                  <Textarea id="bio" placeholder="Short biography or professional summary" />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Add Lecturer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
