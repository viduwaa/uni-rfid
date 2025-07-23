'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { DollarSign, Utensils, History, CheckCircle, Power } from "lucide-react"
import Link from "next/link"

interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  available: boolean
}

export default function CanteenPortal() {
  // State with proper typing
  const [transactionStatus, setTransactionStatus] = useState<boolean>(false)
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [studentInfo, setStudentInfo] = useState<{
    id: string
    name: string
    balance: number
    photo: string
  } | null>(null)
  const [cart, setCart] = useState<MenuItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [dailyTotal, setDailyTotal] = useState<number>(0)
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('canteen-menu-items')
      return saved ? JSON.parse(saved) : [
        { id: 1, name: "Chicken Rice", category: "Main", price: 3.50, available: false },
        { id: 2, name: "Fried Noodles", category: "Main", price: 3.00, available: false },
        { id: 3, name: "Sandwich", category: "Snack", price: 2.50, available: false },
        { id: 4, name: "Fruit Juice", category: "Drink", price: 1.50, available: false },
        { id: 5, name: "Mineral Water", category: "Drink", price: 1.00, available: false },
        { id: 6, name: "Ice Cream", category: "Dessert", price: 2.00, available: false },
      ]
    }
    return []
  })

  // Save to localStorage whenever menuItems changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('canteen-menu-items', JSON.stringify(menuItems))
    }
  }, [menuItems])

  const addToCart = (item: MenuItem) => {
    setCart([...cart, item])
    setTotal(total + item.price)
  }

  // Mock function to simulate RFID scan
  const handleRFIDScan = () => {
    if (!transactionSuccess) return
    
    const mockStudent = {
      id: 'STU-2023-001',
      name: 'John Doe',
      balance: 150.50,
      photo: '/default-avatar.jpg'
    }
    setStudentInfo(mockStudent)
    setCurrentBalance(mockStudent.balance)
    
    // Process payment after card tap
    if (currentBalance && currentBalance >= total) {
      const newBalance = currentBalance - total
      setCurrentBalance(newBalance)
      setDailyTotal(dailyTotal + total)
      
      // Show success state
      setTimeout(() => {
        setStudentInfo(null)
        setCurrentBalance(null)
        setCart([])
        setTotal(0)
        setTransactionSuccess(false)
      }, 2000)
    }
  }

  // Toggle transaction status
  const toggleTransactions = () => {
    setTransactionStatus(!transactionStatus)
    if (!transactionStatus) {
      setStudentInfo(null)
      setCurrentBalance(null)
      setCart([])
      setTotal(0)
      setTransactionSuccess(false)
    }
  }

  // Process payment (now just prepares for RFID tap)
  const prepareForPayment = () => {
    if (cart.length === 0) return
    setTransactionSuccess(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Daily Summary Header */}
      <div className="flex justify-between items-center mb-6 p-4 bg-blue-50 rounded-lg">
        <div>
          <h1 className="text-3xl font-bold">Canteen Portal</h1>
          <p className="text-muted-foreground">Daily Transactions</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${dailyTotal.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Today's Total</p>
        </div>
      </div>

      {/* Transaction Control */}
      <div className="flex justify-end mb-6">
        <Button 
          variant={transactionStatus ? "destructive" : "default"}
          onClick={toggleTransactions}
          className="gap-2"
        >
          <Power className="h-4 w-4" />
          {transactionStatus ? "Stop Transactions" : "Start Transactions"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              {transactionStatus 
                ? transactionSuccess 
                  ? "Tap card to complete payment" 
                  : "Scan RFID card to begin" 
                : "Transactions are currently disabled"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={studentInfo.photo} 
                    alt={studentInfo.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{studentInfo.name}</h3>
                    <p className="text-sm text-muted-foreground">{studentInfo.id}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Balance</p>
                  <div className="text-2xl font-bold">
                    ${currentBalance?.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Amount</p>
                  <div className="text-xl font-bold text-red-600">
                    -${total.toFixed(2)}
                  </div>
                </div>
                {currentBalance && total > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">New Balance</p>
                    <div className="text-xl font-bold text-green-600">
                      ${(currentBalance - total).toFixed(2)}
                    </div>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setStudentInfo(null)
                    setCurrentBalance(null)
                    setTransactionSuccess(false)
                  }}
                >
                  Cancel Transaction
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Button 
                  onClick={handleRFIDScan}
                  disabled={!transactionStatus || !transactionSuccess}
                >
                  {transactionSuccess ? "Tap Card to Pay" : "Simulate RFID Scan"}
                </Button>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  {transactionStatus 
                    ? transactionSuccess
                      ? "Waiting for student to tap card"
                      : "Add items and confirm total first"
                    : "Enable transactions first"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={transactionSuccess ? "border-2 border-green-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {transactionSuccess && <CheckCircle className="h-5 w-5 text-green-500" />}
                Current Transaction
              </CardTitle>
              {transactionSuccess && (
                <CardDescription className="text-green-500">
                  Payment ready - waiting for card tap
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">${item.price.toFixed(2)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setCart(cart.filter((_, i) => i !== index))
                              setTotal(total - item.price)
                              setTransactionSuccess(false)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-xl">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setCart([])
                        setTotal(0)
                        setTransactionSuccess(false)
                      }}
                    >
                      Clear All
                    </Button>
                    <Button 
                      onClick={prepareForPayment}
                      disabled={!transactionStatus || cart.length === 0 || transactionSuccess}
                    >
                      Confirm Total
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Menu */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Menu</CardTitle>
                  <CardDescription>
                    {menuItems.filter(item => item.available).length} items available
                  </CardDescription>
                </div>
                <Link href="/canteen/menu-management">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Utensils className="h-4 w-4" />
                    Manage Menu
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {menuItems.filter(item => item.available).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menuItems
                    .filter(item => item.available)
                    .map(item => (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-start"
                        onClick={() => addToCart(item)}
                        disabled={!transactionStatus || transactionSuccess}
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </span>
                      </Button>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Utensils className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No items available today
                  </p>
                  <Link href="/canteen/menu-management">
                    <Button variant="outline" className="mt-4">
                      Update Menu Availability
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="mt-6">
        <Link href="/canteen/transactions">
          <Card className="hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <History className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all past transactions</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}