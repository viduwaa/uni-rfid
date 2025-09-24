'use client'

import { useState, useEffect } from "react";
import ReadCard from "@/components/ReadCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  category: 'Main' | 'Snack' | 'Drink' | 'Dessert';
  price: number;
  description?: string;
  is_available: boolean;
  is_active: boolean;
}

interface CartItem {
  menu_item_id: string;
  quantity: number;
  name: string;
  price: number;
}

interface StudentData {
  user_id: string;
  register_number: string;
  full_name: string;
  email: string;
  faculty: string;
  card_uid: string;
  balance: number;
  card_status: string;
}

export default function CanteenPaymentDemo() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load menu items
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const response = await fetch('/api/canteen/menu-items');
        const data = await response.json();
        
        if (data.success) {
          const items = data.data?.existingItems || [];
          const availableItems = items
            .filter((item: any) => item.is_available && item.is_active)
            .map((item: any) => ({
              ...item,
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
            }));
          
          setMenuItems(availableItems);
        }
      } catch (error) {
        console.error('Failed to load menu items:', error);
        toast.error('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menu_item_id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          menu_item_id: item.id,
          quantity: 1,
          name: item.name,
          price: item.price
        }];
      }
    });
    
    toast.success(`Added ${item.name} to cart`);
  };

  // Remove item from cart
  const removeFromCart = (menu_item_id: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.menu_item_id === menu_item_id);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.menu_item_id === menu_item_id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.menu_item_id !== menu_item_id);
      }
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  // Handle transaction completion
  const handleTransactionComplete = (success: boolean, message: string) => {
    if (success) {
      toast.success(message);
      clearCart();
    } else {
      toast.error(message);
    }
  };

  // Handle student data received
  const handleStudentDataReceived = (student: StudentData | null) => {
    setCurrentStudent(student);
    if (student) {
      toast.success(`Welcome ${student.full_name}!`);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🍽️ Canteen Payment System</h1>
        <p className="text-muted-foreground">Tap your RFID card to make payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="font-semibold text-green-600">
                        Rs.{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => addToCart(item)} size="sm">
                    Add to Cart
                  </Button>
                </div>
              ))}
              
              {menuItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No menu items available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🛒 Cart ({cart.length} items)</CardTitle>
              {cart.length > 0 && (
                <Button onClick={clearCart} variant="outline" size="sm">
                  Clear Cart
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Rs.{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      Rs.{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      onClick={() => removeFromCart(item.menu_item_id)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              {cart.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Cart is empty
                </p>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">Rs.{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NFC Card Reader */}
      <ReadCard
        cart={cart}
        onTransactionComplete={handleTransactionComplete}
        onStudentDataReceived={handleStudentDataReceived}
      />

      {/* Current Student Info */}
      {currentStudent && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">👤 Current Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {currentStudent.full_name}
              </div>
              <div>
                <strong>Register No:</strong> {currentStudent.register_number}
              </div>
              <div>
                <strong>Balance:</strong> 
                <span className={`ml-1 font-semibold ${
                  currentStudent.balance > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  Rs.{currentStudent.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}