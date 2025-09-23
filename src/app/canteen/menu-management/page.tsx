'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Utensils, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"

// Define MenuItem type
type MenuItem = {
  id: number
  name: string
  category: string
  price: number
  available: boolean
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, name: "Chicken Rice", category: "Main", price: 3.50, available: false },
    { id: 2, name: "Fried Noodles", category: "Main", price: 3.00, available: false },
    { id: 3, name: "Sandwich", category: "Snack", price: 2.50, available: false },
    { id: 4, name: "Fruit Juice", category: "Drink", price: 1.50, available: false },
    { id: 5, name: "Mineral Water", category: "Drink", price: 1.00, available: false },
    { id: 6, name: "Ice Cream", category: "Dessert", price: 2.00, available: false },
  ])

  // Toggle item availability with proper typing
  const toggleAvailability = (id: number) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, available: !item.available } : item
      )
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Utensils className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Menu Management</h1>
        </div>
        <Link href="/canteen" passHref>
          <Button variant="outline">Back to Canteen</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Items for Today</CardTitle>
          <CardDescription>
            {menuItems.filter(item => item.available).length} items available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[200px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(item.id)}
                      className="flex items-center gap-2"
                    >
                      {item.available ? (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          <span>Make Unavailable</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          <span>Make Available</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}