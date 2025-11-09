"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReadCard, { ReadCardRef } from "@/components/ReadCard";
import RFIDOrderProcessor, {
    RFIDOrderProcessorRef,
} from "@/components/RFIDOrderProcessor";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    UtensilsCrossed,
    CreditCard,
    CheckCircle,
    RefreshCw,
    Settings,
    Monitor,
    User,
    Clock,
} from "lucide-react";
import LogoutButton from "@/components/Logout";

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
    name: string;
    price: number;
    quantity: number;
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

export default function CanteenPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [currentStudent, setCurrentStudent] = useState<StudentData | null>(
        null
    );
    const [userRole, setUserRole] = useState<string>("admin");
    const [orderState, setOrderState] = useState<OrderState>({
        status: "waiting_for_order",
        cart: [],
        total: 0,
        student: null,
        message: "Waiting for order...",
    });

    // Keyboard shortcuts state
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
        null
    );
    const [isPaymentMode, setIsPaymentMode] = useState(false);
    const [showKeyboardHelper, setShowKeyboardHelper] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [quickSearch, setQuickSearch] = useState("");

    // Manual payment dialog state
    const [showManualPaymentDialog, setShowManualPaymentDialog] =
        useState(false);
    const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
        totalAmount: number;
        balance: number;
    } | null>(null);

    // Ref for ReadCard component
    const readCardRef = useRef<ReadCardRef>(null);
    const rfidOrderProcessorRef = useRef<RFIDOrderProcessorRef>(null);

    // Get available menu items for keyboard shortcuts
    const availableMenuItems = menuItems.filter((item) => item.is_available);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [
            "All",
            ...new Set(menuItems.map((item) => item.category)),
        ];
        return cats;
    }, [menuItems]);

    // Filter menu items by category and search
    const filteredMenuItems = useMemo(() => {
        let items = availableMenuItems;

        // Filter by category
        if (categoryFilter !== "All") {
            items = items.filter((item) => item.category === categoryFilter);
        }

        // Filter by quick search
        if (quickSearch.trim()) {
            const search = quickSearch.toLowerCase();
            items = items.filter((item) =>
                item.item_name.toLowerCase().includes(search)
            );
        }

        return items;
    }, [availableMenuItems, categoryFilter, quickSearch]);

    // Pagination for menu items (show 10 items per page for keyboard shortcuts 1-9, 0)
    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE);
    const paginatedItems = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE;
        return filteredMenuItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMenuItems, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(0);
        setSelectedItemIndex(null);
    }, [categoryFilter, quickSearch]);

    // Order state management for dual-display system
    const updateOrderState = (newState: Partial<OrderState>) => {
        const updatedState = { ...orderState, ...newState };
        setOrderState(updatedState);
        localStorage.setItem(
            "canteen_order_state",
            JSON.stringify(updatedState)
        );
    };

    const confirmOrder = () => {
        if (cart.length === 0) return;

        const cartItems: CartItem[] = cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        // Update order state to indicate order is ready for payment
        updateOrderState({
            status: "order_ready",
            cart: cartItems,
            total: calculateTotal(),
            message: "Order ready for payment!",
        });
    };

    useEffect(() => {
        fetchMenuItems();
        // Check user role from session/auth
        const role = localStorage.getItem("userRole") || "admin";
        setUserRole(role);

        // Initialize order state
        updateOrderState({
            status: "waiting_for_order",
            cart: [],
            total: 0,
            student: null,
            message: "Waiting for order...",
        });
    }, []);

    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't interfere if user is typing in an input field
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            const key = event.key;

            // Number keys (1-9, 0 for item 10) to select menu items
            if ((key >= "1" && key <= "9") || key === "0") {
                const index = key === "0" ? 9 : parseInt(key) - 1;
                if (index < paginatedItems.length) {
                    setSelectedItemIndex(index);
                    event.preventDefault();
                }
            }

            // Letter keys (a-z) for quick category switching
            else if (
                key >= "a" &&
                key <= "z" &&
                !event.ctrlKey &&
                !event.metaKey
            ) {
                const categoryIndex = key.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
                if (categoryIndex < categories.length) {
                    setCategoryFilter(categories[categoryIndex]);
                    event.preventDefault();
                }
            }

            // Arrow keys for navigation
            else if (key === "ArrowRight" || key === "ArrowDown") {
                setSelectedItemIndex((prev) => {
                    if (prev === null) return 0;
                    return Math.min(prev + 1, paginatedItems.length - 1);
                });
                event.preventDefault();
            } else if (key === "ArrowLeft" || key === "ArrowUp") {
                setSelectedItemIndex((prev) => {
                    if (prev === null) return 0;
                    return Math.max(prev - 1, 0);
                });
                event.preventDefault();
            }

            // Page navigation with PageUp/PageDown or Ctrl+Arrow
            else if (
                key === "PageDown" ||
                (event.ctrlKey && key === "ArrowRight")
            ) {
                if (currentPage < totalPages - 1) {
                    setCurrentPage((prev) => prev + 1);
                    setSelectedItemIndex(null);
                }
                event.preventDefault();
            } else if (
                key === "PageUp" ||
                (event.ctrlKey && key === "ArrowLeft")
            ) {
                if (currentPage > 0) {
                    setCurrentPage((prev) => prev - 1);
                    setSelectedItemIndex(null);
                }
                event.preventDefault();
            }

            // Spacebar to add selected item to cart
            else if (key === " " && selectedItemIndex !== null) {
                const selectedItem = paginatedItems[selectedItemIndex];
                if (selectedItem) {
                    addToCart(selectedItem);
                    // Keep selection for easy multiple additions
                }
                event.preventDefault();
            }

            // Enter to start payment process
            else if (key === "Enter" && cart.length > 0 && !isPaymentMode) {
                startPaymentProcess();
                event.preventDefault();
            }

            // Escape to cancel selection
            else if (key === "Escape") {
                setSelectedItemIndex(null);
                setIsPaymentMode(false);
                setQuickSearch("");
                event.preventDefault();
            }

            // Forward slash (/) to focus search
            else if (key === "/" && !isPaymentMode) {
                const searchInput = document.getElementById("quick-search");
                if (searchInput) {
                    searchInput.focus();
                    event.preventDefault();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        paginatedItems,
        selectedItemIndex,
        cart.length,
        isPaymentMode,
        currentPage,
        totalPages,
        categories,
    ]);

    // Start payment process automatically
    const startPaymentProcess = () => {
        if (cart.length === 0) return;

        setIsPaymentMode(true);
        confirmOrder();

        // Update order state to indicate waiting for card
        updateOrderState({
            status: "tap_card",
            cart: cart,
            total: calculateTotal(),
            message: "Please tap your NFC card to complete payment",
        });

        // Start RFID reading
        if (rfidOrderProcessorRef.current) {
            rfidOrderProcessorRef.current.startReading();
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await fetch("/api/canteen/menu-items");
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setMenuItems(result.data);
                } else {
                    console.error("Failed to fetch menu items:", result.error);
                    // Fallback to sample data
                    setMenuItems(getSampleMenuItems());
                }
            } else {
                console.error("HTTP error:", response.status);
                // Fallback to sample data
                setMenuItems(getSampleMenuItems());
            }
        } catch (error) {
            console.error("Error fetching menu items:", error);
            // Fallback to sample data
            setMenuItems(getSampleMenuItems());
        }
    };

    const getSampleMenuItems = () => [
        {
            menu_item_id: "550e8400-e29b-41d4-a716-446655440001",
            item_name: "Rice & Curry",
            description: "Traditional Sri Lankan rice with mixed vegetables",
            price: 150.0,
            category: "Main",
            is_available: true,
        },
        {
            menu_item_id: "550e8400-e29b-41d4-a716-446655440002",
            item_name: "Chicken Fried Rice",
            description: "Delicious fried rice with chicken pieces",
            price: 200.0,
            category: "Main",
            is_available: true,
        },
        {
            menu_item_id: "550e8400-e29b-41d4-a716-446655440003",
            item_name: "Tea",
            description: "Ceylon black tea",
            price: 20.0,
            category: "Drink",
            is_available: true,
        },
        {
            menu_item_id: "550e8400-e29b-41d4-a716-446655440004",
            item_name: "Coffee",
            description: "Freshly brewed coffee",
            price: 30.0,
            category: "Drink",
            is_available: true,
        },
    ];

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            let newCart;
            const existingItem = prev.find(
                (cartItem) => cartItem.menu_item_id === item.menu_item_id
            );
            if (existingItem) {
                newCart = prev.map((cartItem) =>
                    cartItem.menu_item_id === item.menu_item_id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                newCart = [
                    ...prev,
                    {
                        menu_item_id: item.menu_item_id,
                        name: item.item_name,
                        price: item.price,
                        quantity: 1,
                    },
                ];
            }

            // Update order state for real-time sync
            const newTotal = newCart.reduce(
                (total, cartItem) => total + cartItem.price * cartItem.quantity,
                0
            );
            updateOrderState({
                cart: newCart,
                total: newTotal,
                status:
                    newCart.length > 0 ? "order_ready" : "waiting_for_order",
                message:
                    newCart.length > 0
                        ? `${newCart.length} item(s) in cart`
                        : "Waiting for order...",
            });

            return newCart;
        });
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart((prev) => {
                const newCart = prev.map((item) =>
                    item.menu_item_id === itemId
                        ? { ...item, quantity: newQuantity }
                        : item
                );

                // Update order state for real-time sync
                const newTotal = newCart.reduce(
                    (total, cartItem) =>
                        total + cartItem.price * cartItem.quantity,
                    0
                );
                updateOrderState({
                    cart: newCart,
                    total: newTotal,
                    status:
                        newCart.length > 0
                            ? "order_ready"
                            : "waiting_for_order",
                    message:
                        newCart.length > 0
                            ? `${newCart.length} item(s) in cart`
                            : "Waiting for order...",
                });

                return newCart;
            });
        }
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => {
            const newCart = prev.filter((item) => item.menu_item_id !== itemId);

            // Update order state for real-time sync
            const newTotal = newCart.reduce(
                (total, cartItem) => total + cartItem.price * cartItem.quantity,
                0
            );
            updateOrderState({
                cart: newCart,
                total: newTotal,
                status:
                    newCart.length > 0 ? "order_ready" : "waiting_for_order",
                message:
                    newCart.length > 0
                        ? `${newCart.length} item(s) in cart`
                        : "Waiting for order...",
            });

            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
        updateOrderState({
            status: "waiting_for_order",
            cart: [],
            total: 0,
            student: null,
            message: "Waiting for order...",
        });
    };

    const calculateTotal = () => {
        return cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const handleTransactionComplete = (
        success: boolean,
        transactionData?: any
    ) => {
        if (success) {
            updateOrderState({
                status: "completed",
                message: "Transaction completed successfully!",
            });
            setTimeout(() => {
                clearCart();
                setCurrentStudent(null);
                setIsPaymentMode(false);
                setSelectedItemIndex(null);
                if (rfidOrderProcessorRef.current) {
                    rfidOrderProcessorRef.current.clearData();
                }
            }, 3000);
        } else {
            updateOrderState({
                status: "failed",
                message: transactionData?.error || "Transaction failed",
            });
            setIsPaymentMode(false);
        }
    };

    const handleStudentDataReceived = (studentData: StudentData | null) => {
        if (studentData) {
            setCurrentStudent(studentData);
            updateOrderState({
                status: "tap_card",
                student: studentData,
                message: "Card detected! Processing payment...",
            });
        }
    };

    // Handle insufficient balance callback
    const handleInsufficientBalance = (
        totalAmount: number,
        balance: number
    ) => {
        setInsufficientBalanceData({ totalAmount, balance });
        setShowManualPaymentDialog(true);
    };

    // Handle manual payment confirmation
    const handleManualPaymentConfirm = async (amount: number) => {
        if (rfidOrderProcessorRef.current) {
            await rfidOrderProcessorRef.current.processManualPayment(amount);
        }
        setShowManualPaymentDialog(false);
        setInsufficientBalanceData(null);
    };

    const updateMenuAvailability = async () => {
        try {
            const response = await fetch("/api/canteen/menu-items", {
                method: "POST",
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    fetchMenuItems(); // Refresh the menu items
                } else {
                    console.error(
                        "Failed to update menu availability:",
                        result.error
                    );
                }
            } else {
                console.error("Failed to update menu availability");
            }
        } catch (error) {
            console.error("Error updating menu availability:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 p-2 rounded-full text-white">
                                <UtensilsCrossed className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Canteen Management
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Staff Interface - Menu & Orders
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() =>
                                    window.open(
                                        "/canteen/student-display",
                                        "_blank"
                                    )
                                }
                                variant="outline"
                                className="gap-2"
                            >
                                <Monitor className="h-4 w-4" />
                                Student Display
                            </Button>
                            <Button
                                onClick={() =>
                                    (window.location.href =
                                        "/canteen/transactions")
                                }
                                variant="outline"
                                className="gap-2"
                            >
                                <Clock className="h-4 w-4" />
                                Transactions
                            </Button>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Shopping Cart - Left Column */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="pb-2 border-b-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-500 p-2 rounded-full text-white">
                                            <ShoppingCart className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Current Order</CardTitle>
                                            <CardDescription>
                                                {cart.length}{" "}
                                                {cart.length === 1
                                                    ? "item"
                                                    : "items"}{" "}
                                                • Rs. {calculateTotal()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {cart.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {cart.map((item) => (
                                                <div
                                                    key={item.menu_item_id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Rs. {item.price}{" "}
                                                            each
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded p-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.menu_item_id,
                                                                        item.quantity -
                                                                            1
                                                                    )
                                                                }
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="font-semibold px-2 text-sm">
                                                                {item.quantity}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.menu_item_id,
                                                                        item.quantity +
                                                                            1
                                                                    )
                                                                }
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.menu_item_id
                                                                )
                                                            }
                                                            className="h-6 w-6 p-0 text-red-500"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                                                <span className="font-bold">
                                                    Total
                                                </span>
                                                <span className="text-xl font-bold text-green-600">
                                                    Rs. {calculateTotal()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={
                                                        startPaymentProcess
                                                    }
                                                    className={`${
                                                        isPaymentMode
                                                            ? "bg-blue-600 hover:bg-blue-700"
                                                            : "bg-green-600 hover:bg-green-700"
                                                    }`}
                                                    disabled={cart.length === 0}
                                                >
                                                    {isPaymentMode ? (
                                                        <>
                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                            Waiting for Card...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Pay Now (Enter)
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        clearCart();
                                                        setIsPaymentMode(false);
                                                        setSelectedItemIndex(
                                                            null
                                                        );
                                                    }}
                                                    variant="outline"
                                                    disabled={cart.length === 0}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            No items in cart
                                        </h4>
                                        <p className="text-gray-500 text-sm">
                                            Add items from the menu
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Menu Section - Right Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Menu Items */}
                        <Card>
                            <CardHeader className="border-b-2 pb-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500 p-2 rounded-full text-white">
                                            <UtensilsCrossed className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Menu</CardTitle>
                                            <CardDescription>
                                                Available items for today
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            (window.location.href =
                                                "/canteen/menu-management")
                                        }
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Manage Menu
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Keyboard Shortcuts Helper */}
                                {showKeyboardHelper && (
                                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                                                    ⌨️ Keyboard Shortcuts
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-300">
                                                    <div>
                                                        <div className="font-semibold mb-1">
                                                            Navigation
                                                        </div>
                                                        <div className="space-y-1 ml-2">
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    1-9, 0
                                                                </kbd>{" "}
                                                                Select item
                                                            </div>
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    ← → ↑ ↓
                                                                </kbd>{" "}
                                                                Navigate items
                                                            </div>
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    PgUp/PgDn
                                                                </kbd>{" "}
                                                                Change page
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold mb-1">
                                                            Actions
                                                        </div>
                                                        <div className="space-y-1 ml-2">
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    Space
                                                                </kbd>{" "}
                                                                Add to cart
                                                            </div>
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    Enter
                                                                </kbd>{" "}
                                                                Start payment
                                                            </div>
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    /
                                                                </kbd>{" "}
                                                                Quick search
                                                            </div>
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    A-Z
                                                                </kbd>{" "}
                                                                Filter category
                                                            </div>
                                                            <div>
                                                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                                                    Esc
                                                                </kbd>{" "}
                                                                Cancel
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setShowKeyboardHelper(false)
                                                }
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Search and Filters */}
                                <div className="mb-4 space-y-3">
                                    <div className="relative">
                                        <input
                                            id="quick-search"
                                            type="text"
                                            placeholder="Quick search items... (Press / to focus)"
                                            value={quickSearch}
                                            onChange={(e) =>
                                                setQuickSearch(e.target.value)
                                            }
                                            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                        />
                                        {quickSearch && (
                                            <button
                                                onClick={() =>
                                                    setQuickSearch("")
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Category Filter Pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category, index) => {
                                            const letterKey =
                                                String.fromCharCode(97 + index); // a, b, c, etc.
                                            return (
                                                <button
                                                    key={category}
                                                    onClick={() =>
                                                        setCategoryFilter(
                                                            category
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                        categoryFilter ===
                                                        category
                                                            ? "bg-blue-500 text-white shadow-md"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    {category}
                                                    {index < 26 && (
                                                        <span className="ml-1 text-xs opacity-70">
                                                            ({letterKey})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Results info */}
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            Showing {paginatedItems.length} of{" "}
                                            {filteredMenuItems.length} items
                                            {(categoryFilter !== "All" ||
                                                quickSearch) && (
                                                <span className="ml-2 text-blue-600">
                                                    (filtered)
                                                </span>
                                            )}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            Math.max(
                                                                0,
                                                                prev - 1
                                                            )
                                                        )
                                                    }
                                                    disabled={currentPage === 0}
                                                    className="px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                                >
                                                    ←
                                                </button>
                                                <span>
                                                    Page {currentPage + 1} /{" "}
                                                    {totalPages}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            Math.min(
                                                                totalPages - 1,
                                                                prev + 1
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        totalPages - 1
                                                    }
                                                    className="px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                                >
                                                    →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {menuItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {paginatedItems.map((item, index) => {
                                            const isSelected =
                                                selectedItemIndex === index;
                                            const shortcutNumber =
                                                index === 9 ? 0 : index + 1;

                                            return (
                                                <div
                                                    key={item.menu_item_id}
                                                    className={`border rounded-lg p-4 transition-all relative ${
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg scale-105 ring-2 ring-blue-500"
                                                            : "border-gray-200 bg-white dark:bg-gray-800 hover:shadow-md hover:border-blue-300"
                                                    }`}
                                                >
                                                    {/* Keyboard shortcut number */}
                                                    {index < 10 && (
                                                        <div
                                                            className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                                                isSelected
                                                                    ? "bg-blue-500 text-white ring-2 ring-white"
                                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                            }`}
                                                        >
                                                            {shortcutNumber}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mb-3 ml-9">
                                                        <div className="flex-1">
                                                            <h4
                                                                className={`font-semibold text-base ${
                                                                    isSelected
                                                                        ? "text-blue-800 dark:text-blue-200"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {item.item_name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`text-lg font-bold ${
                                                                        isSelected
                                                                            ? "text-blue-600"
                                                                            : "text-green-600"
                                                                    }`}
                                                                >
                                                                    Rs.{" "}
                                                                    {item.price}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between ml-9">
                                                        <div className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                                            {item.category}
                                                        </div>
                                                        <Button
                                                            onClick={() =>
                                                                addToCart(item)
                                                            }
                                                            size="sm"
                                                            className={`ml-auto ${
                                                                isSelected
                                                                    ? "bg-blue-500 hover:bg-blue-600 animate-pulse"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            {isSelected
                                                                ? "Space"
                                                                : "Add"}
                                                        </Button>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none animate-pulse"></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <UtensilsCrossed className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            No menu items
                                        </h4>
                                        <p className="text-gray-500 text-sm">
                                            Menu items will appear here
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* NFC Payment Section */}
                <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500 p-3 rounded-full text-white">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-green-800 dark:text-green-200">
                                    NFC Payment System
                                </CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-400">
                                    Secure contactless transactions ready
                                </CardDescription>
                            </div>
                            <div className="ml-auto">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RFIDOrderProcessor
                            ref={rfidOrderProcessorRef}
                            cart={cart}
                            onTransactionComplete={handleTransactionComplete}
                            onInsufficientBalance={handleInsufficientBalance}
                            autoStart={isPaymentMode}
                        />
                    </CardContent>
                </Card>
            </main>

            {/* Manual Payment Dialog */}
            {showManualPaymentDialog &&
                insufficientBalanceData &&
                currentStudent && (
                    <ManualPaymentDialog
                        isOpen={showManualPaymentDialog}
                        onClose={() => {
                            setShowManualPaymentDialog(false);
                            setInsufficientBalanceData(null);
                        }}
                        onConfirm={handleManualPaymentConfirm}
                        totalAmount={insufficientBalanceData.totalAmount}
                        currentBalance={insufficientBalanceData.balance}
                        studentName={currentStudent.full_name}
                    />
                )}
        </div>
    );
}
