'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Calendar, Search } from "lucide-react"

interface TransactionItem {
  name: string
  category: 'Main' | 'Snack' | 'Drink' | 'Dessert'
  quantity: number
  unit_price: number
  total_price: number
}

interface Transaction {
  id: string
  transaction_id: string
  student_id: string
  register_number: string
  full_name: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  items: TransactionItem[]
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load transactions from API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '50'
        })

        if (searchQuery.trim()) {
          params.append('food_name', searchQuery.trim())
        }
        if (startDate) {
          params.append('start_date', startDate)
        }
        if (endDate) {
          params.append('end_date', endDate)
        }

        const response = await fetch(`/api/transactions?${params.toString()}`)
        const data = await response.json()
        
        if (data.success) {
          setTransactions(data.data)
          setFilteredTransactions(data.data)
          setTotalPages(data.pagination?.pages || 1)
        } else {
          console.error('Failed to load transactions:', data.message)
          // Load mock data as fallback
          loadMockData()
        }
      } catch (error) {
        console.error('Error loading transactions:', error)
        // Load mock data as fallback
        loadMockData()
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [currentPage, searchQuery, startDate, endDate])

  // Mock data fallback
  const loadMockData = () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        transaction_id: 'TXN-001',
        student_id: 'user-1',
        register_number: 'STU-2023-001',
        full_name: 'John Doe',
        amount: 4.50,
        status: 'completed',
        created_at: new Date('2024-03-15T12:30:00').toISOString(),
        items: [
          { name: 'Chicken Rice', category: 'Main', quantity: 1, unit_price: 3.50, total_price: 3.50 },
          { name: 'Mineral Water', category: 'Drink', quantity: 1, unit_price: 1.00, total_price: 1.00 }
        ]
      },
      {
        id: '2',
        transaction_id: 'TXN-002',
        student_id: 'user-2',
        register_number: 'STU-2023-002',
        full_name: 'Jane Smith',
        amount: 7.50,
        status: 'completed',
        created_at: new Date('2024-03-15T13:15:00').toISOString(),
        items: [
          { name: 'Fried Noodles', category: 'Main', quantity: 2, unit_price: 3.00, total_price: 6.00 },
          { name: 'Fruit Juice', category: 'Drink', quantity: 1, unit_price: 1.50, total_price: 1.50 }
        ]
      },
      {
        id: '3',
        transaction_id: 'TXN-003',
        student_id: 'user-3',
        register_number: 'STU-2023-003',
        full_name: 'Mike Johnson',
        amount: 4.50,
        status: 'failed',
        created_at: new Date('2024-03-14T11:45:00').toISOString(),
        items: [
          { name: 'Sandwich', category: 'Snack', quantity: 1, unit_price: 2.50, total_price: 2.50 },
          { name: 'Ice Cream', category: 'Dessert', quantity: 1, unit_price: 2.00, total_price: 2.00 }
        ]
      },
      {
        id: '4',
        transaction_id: 'TXN-004',
        student_id: 'user-1',
        register_number: 'STU-2023-001',
        full_name: 'John Doe',
        amount: 3.00,
        status: 'completed',
        created_at: new Date('2024-03-13T14:20:00').toISOString(),
        items: [
          { name: 'Mineral Water', category: 'Drink', quantity: 3, unit_price: 1.00, total_price: 3.00 }
        ]
      },
      {
        id: '5',
        transaction_id: 'TXN-005',
        student_id: 'user-4',
        register_number: 'STU-2023-004',
        full_name: 'Sarah Wilson',
        amount: 9.50,
        status: 'completed',
        created_at: new Date('2024-03-12T10:15:00').toISOString(),
        items: [
          { name: 'Chicken Rice', category: 'Main', quantity: 1, unit_price: 3.50, total_price: 3.50 },
          { name: 'Fried Noodles', category: 'Main', quantity: 1, unit_price: 3.00, total_price: 3.00 },
          { name: 'Fruit Juice', category: 'Drink', quantity: 2, unit_price: 1.50, total_price: 3.00 }
        ]
      }
    ]
    
    setTransactions(mockTransactions)
    setFilteredTransactions(mockTransactions)
  }

  // Filter transactions locally (for mock data or additional filtering)
  useEffect(() => {
    if (transactions.length === 0) return

    let filtered = transactions

    // Additional local filtering if needed
    // (API already handles most filtering, but this is for client-side refinement)
    
    setFilteredTransactions(filtered)
  }, [transactions])

  // Export to Excel (CSV format)
  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export')
      return
    }

    // Create CSV content
    const headers = ['Transaction ID', 'Student ID', 'Student Name', 'Items', 'Total', 'Date', 'Time', 'Status']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        transaction.transaction_id,
        transaction.register_number,
        `"${transaction.full_name}"`,
        `"${transaction.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}"`,
        transaction.amount.toFixed(2),
        new Date(transaction.created_at).toLocaleDateString(),
        new Date(transaction.created_at).toLocaleTimeString(),
        transaction.status
      ].join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `canteen_transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Transaction History</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            className="gap-2"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.location.href = '/canteen'}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Canteen
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Filter transactions by food name or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Food Name</Label>
              <Input
                id="search"
                placeholder="Enter food name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTransactions.length} transactions
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Complete transaction history with filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No transactions found</p>
              <p>Try adjusting your search or date filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-lg">
                          {transaction.transaction_id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Student ID: {transaction.register_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.full_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.created_at)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {transaction.items.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded px-3 py-2"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                              ({item.category})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm">
                              {item.quantity}x ${item.unit_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}