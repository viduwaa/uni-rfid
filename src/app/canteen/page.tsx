'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, } from "@/components/ui/card"
import { CheckCircle, DollarSign, AlertTriangle, LogOut } from "lucide-react"
import DeviceStatus from '@/components/DeviceStatus'

interface MenuItem {
  id: string
  name: string
  category: 'Main' | 'Snack' | 'Drink' | 'Dessert'
  price: number
  description?: string
  is_available: boolean
  is_active: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

interface StudentInfo {
  user_id: string
  register_number: string
  full_name: string
  card_uid: string
  balance: number
  transactionId: string
}

export default function CanteenPortal() {
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [dailyTotal, setDailyTotal] = useState<number>(0)
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false)
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>()

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

// Load menu items from API
useEffect(() => {
  const loadMenuItems = async () => {
    try {
      const response = await fetch('/api/canteen/menu-items')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.success) {
        let items = []
        
        // Handle different response structures
        if (Array.isArray(data.data)) {
          // Direct array response
          items = data.data
        } else if (data.data?.existingItems) {
          // Nested structure response
          items = data.data.existingItems
        } else {
          console.warn('Unexpected response structure:', data)
          items = []
        }

        // Filter for available items and convert price
        const availableItems = items
          .filter((item: any) => item.is_available && item.is_active)
          .map((item: any) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          }))

        console.log('Processed items:', availableItems)
        setMenuItems(availableItems)
      } else {
        console.error('API error:', data.message)
        setMenuItems([])
      }
    } catch (error) {
      console.error('Failed to load menu items:', error)
      setMenuItems([])
    }
  }

  loadMenuItems()
}, [])
  // Load daily total from API
  useEffect(() => {
    const loadDailySummary = async () => {
      try {
        const response = await fetch('/api/canteen/dashboard/daily-summary')
        const data = await response.json()
        if (data.success) {
          setDailyTotal(data.data.total_revenue || 0)
        }
      } catch (error) {
        console.error('Failed to load daily summary:', error)
      }
    }

    loadDailySummary()
  }, [])

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setTotal(newTotal)
  }, [cart])

  const addToCart = (item: MenuItem) => {
    if (orderConfirmed) return
    
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: string) => {
    if (orderConfirmed) return
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (orderConfirmed || newQuantity < 0) return
    
    if (newQuantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const confirmOrder = () => {
    if (cart.length === 0) return
    setOrderConfirmed(true)
    setPaymentProcessing(true)
  }

  const handleRFIDScan = async () => {
    if (!orderConfirmed || !paymentProcessing) return
    
    try {
      // Simulate RFID scan - in real implementation, this would get card_uid from RFID reader
      const mockCardUID = 'CARD001'
      
      // Get student info by card
      const studentResponse = await fetch(`/api/students/card/${mockCardUID}`)
      const studentData = await studentResponse.json()
      
      if (!studentData.success) {
        alert('Card not found or inactive')
        return
      }

      const student = studentData.data
      const mockStudent: StudentInfo = {
        user_id: student.user_id,
        register_number: student.register_number,
        full_name: student.full_name,
        card_uid: mockCardUID,
        balance: student.balance,
        transactionId: `TXN-${Date.now()}`
      }

      setStudentInfo(mockStudent)
      setCurrentBalance(mockStudent.balance)
      
      // Process payment after card tap
      setTimeout(async () => {
        if (mockStudent.balance >= total) {
          try {
            // Create transaction
            const transactionResponse = await fetch('/api/canteen/transactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                student_id: student.user_id,
                card_uid: mockCardUID,
                items: cart.map(item => ({
                  menu_item_id: item.id,
                  quantity: item.quantity
                }))
              })
            })

            const transactionData = await transactionResponse.json()
            
            if (transactionData.success) {
              const newBalance = mockStudent.balance - total
              setCurrentBalance(newBalance)
              setDailyTotal(prevDaily => prevDaily + total)
              
              // Show success and reset after 2 seconds
              setTimeout(() => {
                resetTransaction()
              }, 2000)
            } else {
              alert('Transaction failed: ' + transactionData.message)
              setTimeout(() => {
                setStudentInfo(null)
                setCurrentBalance(null)
                setPaymentProcessing(false)
              }, 3000)
            }
          } catch (error) {
            console.error('Transaction error:', error)
            alert('Transaction failed due to system error')
          }
        } else {
          // Insufficient funds - don't clear cart
          setTimeout(() => {
            setStudentInfo(null)
            setCurrentBalance(null)
            setPaymentProcessing(false)
          }, 3000)
        }
      }, 1000)
    } catch (error) {
      console.error('RFID scan error:', error)
      alert('Failed to process card scan')
    }
  }

  const resetTransaction = () => {
    setStudentInfo(null)
    setCurrentBalance(null)
    setCart([])
    setTotal(0)
    setOrderConfirmed(false)
    setPaymentProcessing(false)
  }

  const cancelOrder = () => {
    setOrderConfirmed(false)
    setPaymentProcessing(false)
    setStudentInfo(null)
    setCurrentBalance(null)
  }

  // Safe filtering with array check

  const safeMenuItems = Array.isArray(menuItems) ? menuItems : []
  const availableItems = safeMenuItems.filter(item => item.is_available && item.is_active)

  const groupedItems = availableItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
    return groups
  }, {} as Record<string, MenuItem[]>)

  const categories = ['Main', 'Snack', 'Drink', 'Dessert'] as const
  const availableCategories = categories.filter(category => groupedItems[category]?.length > 0)

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Daily Summary Header */}
      <div className="flex justify-between items-center mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Canteen Portal</h1>
          <p className="text-gray-600 dark:text-gray-400">Daily Transactions - {getCurrentDate()}</p>
        </div>
        <DeviceStatus/>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            Rs.{dailyTotal.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Student Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              {paymentProcessing 
                ? "Tap card to complete payment" 
                : orderConfirmed 
                  ? "Order confirmed - waiting for payment"
                  : "Add items and confirm order"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Student ID</p>
                  <div className="font-mono text-lg">{studentInfo.register_number}</div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Student Name</p>
                  <div className="text-sm">{studentInfo.full_name}</div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Card Balance</p>
                  <div className="text-2xl font-bold">
                    ${currentBalance?.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transaction Amount</p>
                  <div className="text-xl font-bold text-red-600">
                    -${total.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <div className={`flex items-center gap-2 ${
                    currentBalance && currentBalance >= total 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {currentBalance && currentBalance >= total ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Sufficient Balance</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span>Insufficient Balance</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transaction ID</p>
                  <div className="font-mono text-sm">{studentInfo.transactionId}</div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={cancelOrder}
                >
                  Cancel Transaction
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Button 
                  onClick={handleRFIDScan}
                  disabled={!orderConfirmed || !paymentProcessing}
                  className="mb-4"
                >
                  Simulate RFID Scan
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {orderConfirmed 
                    ? "Waiting for student to tap card"
                    : "Confirm order first to enable payment"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Menu */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Transaction */}
          <Card className={orderConfirmed ? "border-2 border-green-500" : ""}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {orderConfirmed && <CheckCircle className="h-5 w-5 text-green-500" />}
                    Current Transaction
                  </CardTitle>
                  {orderConfirmed && (
                    <CardDescription className="text-green-500">
                      Order confirmed - ready for payment
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={orderConfirmed}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={orderConfirmed}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium w-16 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            disabled={orderConfirmed}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={resetTransaction}
                      disabled={paymentProcessing}
                    >
                      Clear All
                    </Button>
                    <Button 
                      onClick={confirmOrder}
                      disabled={cart.length === 0 || orderConfirmed}
                    >
                      Confirm Order
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No items added yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Menu by Category */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Menu</CardTitle>
                  <CardDescription>
                    {availableItems.length} items available across {availableCategories.length} categories
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/canteen/menu-management'}
                >
                  Manage Menu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {availableCategories.length > 0 ? (
                <div className="space-y-6">
                  {availableCategories.map(category => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {groupedItems[category].map(item => (
                          <Button
                            key={item.id}
                            variant="outline"
                            className="h-auto py-3 flex flex-col items-start hover:bg-blue-50 dark:hover:bg-blue-950"
                            onClick={() => addToCart(item)}
                            disabled={orderConfirmed}
                          >
                            <span className="font-medium text-left">{item.name}</span>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              ${item.price.toFixed(2)}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {safeMenuItems.length === 0 ? 'Loading menu items...' : 'No items available today'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = '/canteen/menu-management'}
                  >
                    {safeMenuItems.length === 0 ? 'Manage Menu' : 'Update Menu Availability'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="mt-6">
        <Card 
          className="hover:shadow-md transition-all h-full cursor-pointer"
          onClick={() => window.location.href = '/canteen/transactions'}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <DollarSign className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all past transactions</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 flex justify-end px-5">
        <Button variant="outline" size="sm"
              onClick={() => window.location.href = '/'}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}