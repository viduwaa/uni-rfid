"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle,
    AlertTriangle,
    CreditCard,
    User,
    Clock,
    Wifi,
    ShoppingCart,
    DollarSign,
    XCircle,
    Loader2,
    UtensilsCrossed,
} from "lucide-react";
import { getFacultyName } from "@/lib/utils";

interface MenuItem {
    menu_item_id: string;
    item_name: string;
    description: string;
    price: number;
    category: string;
    is_available: boolean;
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

interface OrderState {
    status:
        | "waiting_for_order"
        | "order_ready"
        | "tap_card"
        | "processing"
        | "completed"
        | "failed";
    cart: CartItem[];
    total: number;
    student: StudentData | null;
    message: string;
}

export default function StudentDisplay() {
    const [orderState, setOrderState] = useState<OrderState>({
        status: "waiting_for_order",
        cart: [],
        total: 0,
        student: null,
        message: "Waiting for order...",
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // Fetch menu items
    const fetchMenuItems = async () => {
        try {
            const response = await fetch("/api/canteen/menu-items");
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setMenuItems(result.data);
                }
            }
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch menu items on mount
    useEffect(() => {
        fetchMenuItems();
        // Refresh menu items every 30 seconds
        const menuRefreshInterval = setInterval(fetchMenuItems, 30000);
        return () => clearInterval(menuRefreshInterval);
    }, []);

    // Real-time order status updates (WebSocket or polling)
    useEffect(() => {
        // TODO: Implement WebSocket connection for real-time updates
        // For now, we'll simulate with localStorage polling
        const pollOrderStatus = () => {
            const savedOrderState = localStorage.getItem("canteen_order_state");
            if (savedOrderState) {
                try {
                    const parsed = JSON.parse(savedOrderState);
                    setOrderState(parsed);
                } catch (error) {
                    console.error("Error parsing order state:", error);
                }
            }
        };

        // Poll every 500ms for real-time updates
        const interval = setInterval(pollOrderStatus, 500);
        pollOrderStatus(); // Initial load

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting_for_order":
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
            case "order_ready":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
            case "tap_card":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
            case "processing":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
            case "completed":
                return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
            case "failed":
                return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getStatusIcon = () => {
        switch (orderState.status) {
            case "waiting_for_order":
                return <ShoppingCart className="h-16 w-16 text-gray-400" />;
            case "order_ready":
                return <CheckCircle className="h-16 w-16 text-blue-500" />;
            case "tap_card":
                return (
                    <CreditCard className="h-16 w-16 text-amber-500 animate-pulse" />
                );
            case "processing":
                return (
                    <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
                );
            case "completed":
                return <CheckCircle className="h-16 w-16 text-green-500" />;
            case "failed":
                return <XCircle className="h-16 w-16 text-red-500" />;
            default:
                return <ShoppingCart className="h-16 w-16 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 border-b shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-3 rounded-full text-white">
                                <User className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    Student Display
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    University Canteen
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                {currentTime.toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                {currentTime.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-6 py-8 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                    {/* Status Card */}
                    <Card className="text-center overflow-hidden shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Wifi className="h-8 w-8" />
                                <h2 className="text-3xl font-bold">
                                    Order Status
                                </h2>
                            </div>
                            <Badge
                                className={`text-lg px-6 py-2 ${getStatusColor(orderState.status)}`}
                            >
                                {orderState.status
                                    .replace("_", " ")
                                    .toUpperCase()}
                            </Badge>
                        </div>

                        <CardContent className="p-12">
                            <div className="space-y-8">
                                {/* Status Icon */}
                                <div className="flex justify-center">
                                    {getStatusIcon()}
                                </div>

                                {/* Status Message */}
                                <div>
                                    <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                                        {orderState.message}
                                    </h3>

                                    {/* Current Order Price Display */}
                                    {orderState.cart.length > 0 && (
                                        <div className="mb-6">
                                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full border-2 border-blue-200 dark:border-blue-700">
                                                <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                                    Order Total: Rs.{" "}
                                                    {orderState.total}
                                                </span>
                                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                                    ({orderState.cart.length}{" "}
                                                    {orderState.cart.length ===
                                                    1
                                                        ? "item"
                                                        : "items"}
                                                    )
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {orderState.status ===
                                        "waiting_for_order" && (
                                        <p className="text-xl text-slate-600 dark:text-slate-400">
                                            Please wait for staff to prepare
                                            your order
                                        </p>
                                    )}

                                    {orderState.status === "order_ready" && (
                                        <p className="text-xl text-slate-600 dark:text-slate-400">
                                            Your order is ready! Please proceed
                                            to payment
                                        </p>
                                    )}

                                    {orderState.status === "tap_card" && (
                                        <p className="text-xl text-amber-600 dark:text-amber-400 animate-pulse">
                                            Please tap your NFC card on the
                                            reader
                                        </p>
                                    )}

                                    {orderState.status === "processing" && (
                                        <p className="text-xl text-purple-600 dark:text-purple-400">
                                            Processing your payment...
                                        </p>
                                    )}
                                </div>

                                {/* Order Details */}
                                {orderState.cart.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                                        <h4 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-300">
                                            Your Order
                                        </h4>
                                        <div className="space-y-3">
                                            {orderState.cart.map((item) => (
                                                <div
                                                    key={item.menu_item_id}
                                                    className="flex justify-between items-center"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-lg">
                                                            {item.name}
                                                        </span>
                                                        <Badge variant="secondary">
                                                            x{item.quantity}
                                                        </Badge>
                                                    </div>
                                                    <span className="font-semibold text-lg">
                                                        Rs.{" "}
                                                        {item.price *
                                                            item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="flex justify-between items-center text-2xl font-bold">
                                            <span>Total</span>
                                            <span className="text-green-600">
                                                Rs. {orderState.total}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Insufficient Funds Warning */}
                                {orderState.student &&
                                    orderState.cart.length > 0 &&
                                    orderState.student.balance <
                                        orderState.total && (
                                        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-2xl">
                                                        ⚠️
                                                    </span>
                                                </div>
                                                <h4 className="text-2xl font-bold text-red-700 dark:text-red-300">
                                                    Insufficient Funds
                                                </h4>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <p className="text-lg text-red-600 dark:text-red-400">
                                                    Your current balance is
                                                    insufficient for this order
                                                </p>
                                                <div className="bg-white dark:bg-red-900 rounded-lg p-4 inline-block">
                                                    <div className="flex justify-between items-center gap-8 text-lg">
                                                        <span className="text-red-700 dark:text-red-300">
                                                            Order Total:
                                                        </span>
                                                        <span className="font-bold text-red-800 dark:text-red-200">
                                                            Rs.{" "}
                                                            {orderState.total}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-8 text-lg">
                                                        <span className="text-red-700 dark:text-red-300">
                                                            Your Balance:
                                                        </span>
                                                        <span className="font-bold text-red-800 dark:text-red-200">
                                                            Rs.{" "}
                                                            {
                                                                orderState
                                                                    .student
                                                                    .balance
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="border-t border-red-300 dark:border-red-600 mt-2 pt-2">
                                                        <div className="flex justify-between items-center gap-8 text-lg font-bold">
                                                            <span className="text-red-700 dark:text-red-300">
                                                                Additional
                                                                Needed:
                                                            </span>
                                                            <span className="text-red-800 dark:text-red-200">
                                                                Rs.{" "}
                                                                {(
                                                                    orderState.total -
                                                                    orderState
                                                                        .student
                                                                        .balance
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-4">
                                                    Please top up your card or
                                                    contact staff for assistance
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {/* Student Info */}
                                {orderState.student && (
                                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6">
                                        <h4 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-300">
                                            Student Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-left">
                                            <div>
                                                <p className="font-medium text-slate-600 dark:text-slate-400">
                                                    Name
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {
                                                        orderState.student
                                                            .full_name
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-600 dark:text-slate-400">
                                                    Student ID
                                                </p>
                                                <p className="text-lg font-mono">
                                                    {
                                                        orderState.student
                                                            .register_number
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-600 dark:text-slate-400">
                                                    Faculty
                                                </p>
                                                <p className="text-lg">
                                                    {getFacultyName(orderState.student.faculty)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-600 dark:text-slate-400">
                                                    Balance
                                                </p>
                                                <p
                                                    className={`text-lg font-bold ${
                                                        orderState.cart.length >
                                                            0 &&
                                                        orderState.student
                                                            .balance <
                                                            orderState.total
                                                            ? "text-red-600 dark:text-red-400"
                                                            : "text-green-600 dark:text-green-400"
                                                    }`}
                                                >
                                                    Rs.{" "}
                                                    {orderState.student.balance}
                                                    {orderState.cart.length >
                                                        0 && (
                                                        <span className="text-sm ml-2 opacity-75">
                                                            {orderState.student
                                                                .balance >=
                                                            orderState.total
                                                                ? "✅ Sufficient"
                                                                : "❌ Insufficient"}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Transaction Result */}
                                {orderState.status === "completed" && (
                                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-6">
                                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                        <h4 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                                            Transaction Successful!
                                        </h4>
                                        <p className="text-lg text-green-600 dark:text-green-400">
                                            Your payment has been processed
                                            successfully
                                        </p>
                                    </div>
                                )}

                                {orderState.status === "failed" && (
                                    <div className="bg-red-50 dark:bg-red-950 rounded-lg p-6">
                                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                        <h4 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
                                            Transaction Failed
                                        </h4>
                                        <p className="text-lg text-red-600 dark:text-red-400">
                                            {orderState.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Menu Availability */}
                    {menuItems.length > 0 && (
                        <Card className="mt-6 overflow-hidden shadow-xl">
                            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                                <div className="flex items-center justify-center gap-4">
                                    <UtensilsCrossed className="h-8 w-8" />
                                    <h2 className="text-2xl font-bold">
                                        Today's Menu
                                    </h2>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {menuItems.map((item) => (
                                        <div
                                            key={item.menu_item_id}
                                            className={`p-4 rounded-lg border transition-all ${
                                                item.is_available
                                                    ? "bg-white border-green-200 shadow-sm"
                                                    : "bg-gray-100 border-gray-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4
                                                    className={`font-semibold text-lg ${
                                                        item.is_available
                                                            ? "text-slate-800"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {item.item_name}
                                                </h4>
                                                <Badge
                                                    variant={
                                                        item.is_available
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className={
                                                        item.is_available
                                                            ? "bg-green-500"
                                                            : ""
                                                    }
                                                >
                                                    {item.is_available
                                                        ? "Available"
                                                        : "Sold Out"}
                                                </Badge>
                                            </div>
                                            <p
                                                className={`text-sm mb-2 ${
                                                    item.is_available
                                                        ? "text-slate-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {item.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span
                                                    className={`text-xl font-bold ${
                                                        item.is_available
                                                            ? "text-green-600"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    Rs. {item.price}
                                                </span>
                                                <span
                                                    className={`text-sm px-2 py-1 rounded ${
                                                        item.category === "Main"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : item.category ===
                                                                "Drink"
                                                              ? "bg-purple-100 text-purple-800"
                                                              : item.category ===
                                                                  "Snack"
                                                                ? "bg-orange-100 text-orange-800"
                                                                : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
