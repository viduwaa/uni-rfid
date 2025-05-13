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

export default function AddStudent() {
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  console.log(process.env.DATABASE_URL)

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
    toast.success("Student Added",{
      description: "The student has been successfully added to the system.",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/admin/dashboard" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        </div>

        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Enter the details of the new student to register them in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                    {photoPreview ? (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Student preview"
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
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="registerNumber">Register Number</Label>
                    <Input id="registerNumber" placeholder="UNI2023001" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@university.edu" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Faculty</Label>
                    <Select>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select Faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tec">Technology</SelectItem>
                        <SelectItem value="app">Applied Sciences</SelectItem>
                        <SelectItem value="ssh">Social Sciences & Humanities</SelectItem>
                        <SelectItem value="mgt">Management Studies</SelectItem>
                        <SelectItem value="agr">Agriculture</SelectItem>
                        <SelectItem value="med">Medicine and Allied Sciences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Study</Label>
                    <Select>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">First Year</SelectItem>
                        <SelectItem value="2">Second Year</SelectItem>
                        <SelectItem value="3">Third Year</SelectItem>
                        <SelectItem value="4">Fourth Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Student's address" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Add Student</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
