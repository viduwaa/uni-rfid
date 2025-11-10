"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Utensils,
    ToggleLeft,
    ToggleRight,
    Plus,
    Trash2,
    ArrowLeft,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import formatCurrency from "@/lib/formatCurrency";

type MenuItem = {
    menu_item_id: string; // Changed from id to menu_item_id
    item_name: string; // Changed from name to item_name
    category: "Main" | "Snack" | "Drink" | "Dessert";
    price: string | number; // API returns string, but we handle both
    description?: string;
    is_available: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export default function MenuManagement() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // New item form state
    const [newItem, setNewItem] = useState({
        name: "",
        category: "" as MenuItem["category"] | "",
        price: "",
        description: "",
    });

    // Load menu items from API
    useEffect(() => {
        const loadMenuItems = async () => {
            try {
                // Use the correct API endpoint
                const response = await fetch("/api/canteen/menu-items");
                const data = await response.json();

                console.log("API Response:", data); // Debug log

                if (data.success) {
                    // The API returns data directly as an array
                    const items = data.data || [];
                    console.log("Menu items loaded:", items); // Debug log
                    setMenuItems(items);
                } else {
                    console.error("API error:", data.message);
                }
            } catch (error) {
                console.error("Failed to load menu items:", error);
            } finally {
                setLoading(false);
            }
        };

        loadMenuItems();
    }, []);

    // Toggle item availability
    const toggleAvailability = async (menu_item_id: string) => {
        try {
            const item = menuItems.find(
                (item) => item.menu_item_id === menu_item_id
            );
            if (!item) return;

            const response = await fetch("/api/canteen/menu-items", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: menu_item_id, // Backend expects 'id' parameter
                    is_available: !item.is_available,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMenuItems((prevItems) =>
                    prevItems.map((item) =>
                        item.menu_item_id === menu_item_id
                            ? { ...item, is_available: !item.is_available }
                            : item
                    )
                );
            } else {
                alert("Failed to update item availability: " + data.message);
            }
        } catch (error) {
            console.error("Error toggling availability:", error);
            alert("Failed to update item availability");
        }
    };

    // Delete item (soft delete by setting is_active to false)
    const deleteItem = async (menu_item_id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) {
            return;
        }

        try {
            const response = await fetch(
                `/api/canteen/menu-items?id=${menu_item_id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (data.success) {
                // Remove from local state
                setMenuItems((prevItems) =>
                    prevItems.filter(
                        (item) => item.menu_item_id !== menu_item_id
                    )
                );
                alert("Item deleted successfully!");
            } else {
                alert("Failed to delete item: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item: " + (error as Error).message);
        }
    };

    // Add new item
    const addNewItem = async () => {
        if (!newItem.name.trim() || !newItem.category || !newItem.price) {
            alert(
                "Please fill in all required fields (name, category, and price)"
            );
            return;
        }

        const price = parseFloat(newItem.price);
        if (isNaN(price) || price <= 0) {
            alert("Please enter a valid price");
            return;
        }

        const itemData = {
            name: newItem.name.trim(),
            category: newItem.category as MenuItem["category"],
            price: price,
            description: newItem.description.trim() || undefined,
        };

        try {
            console.log("Sending data:", itemData); // Debug log

            const response = await fetch("/api/canteen/new-item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itemData),
            });

            console.log("Response status:", response.status); // Debug log

            const data = await response.json();
            console.log("Response data:", data); // Debug log

            if (data.success) {
                // Add to local state
                setMenuItems((prevItems) => {
                    const safeItems = Array.isArray(prevItems) ? prevItems : [];
                    return [...safeItems, data.data];
                });

                // Reset form
                setNewItem({
                    name: "",
                    category: "",
                    price: "",
                    description: "",
                });

                alert("Item added successfully!");
            } else {
                console.error("API error:", data);
                alert(
                    "Failed to add item: " + (data.message || "Unknown error")
                );
            }
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item: " + (error as Error).message);
        }
    };

    // Handle form input changes
    const handleInputChange = (field: keyof typeof newItem, value: string) => {
        setNewItem((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Loading menu items...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6">
            <PageHeader
                title="Menu Management"
                breadcrumbs={[
                    { label: "Canteen Portal", href: "/canteen" },
                    { label: "Menu Management" },
                ]}
                backHref="/canteen"
                centerIcon={
                    <span className="inline-flex items-center justify-center">
                        <Utensils className="h-6 w-6 text-primary" />
                    </span>
                }
            />

            {/* Add New Item Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Menu Item
                    </CardTitle>
                    <CardDescription>
                        Add new food items to your menu inventory
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label htmlFor="item-name">Food Name *</Label>
                            <Input
                                id="item-name"
                                placeholder="Enter food name"
                                value={newItem.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item-category">Category *</Label>
                            <Select
                                value={newItem.category}
                                onValueChange={(value) =>
                                    handleInputChange("category", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Main">Main</SelectItem>
                                    <SelectItem value="Snack">Snack</SelectItem>
                                    <SelectItem value="Drink">Drink</SelectItem>
                                    <SelectItem value="Dessert">
                                        Dessert
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item-price">Price (Rs) *</Label>
                            <Input
                                id="item-price"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={newItem.price}
                                onChange={(e) =>
                                    handleInputChange("price", e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item-description">
                                Description
                            </Label>
                            <Input
                                id="item-description"
                                placeholder="Optional description"
                                value={newItem.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={addNewItem}
                                className="w-full gap-2"
                                disabled={
                                    !newItem.name.trim() ||
                                    !newItem.category ||
                                    !newItem.price
                                }
                            >
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        * Required fields. New items will be added as
                        unavailable by default. Use the toggle to make them
                        available.
                    </p>
                </CardContent>
            </Card>

            {/* Menu Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Menu Items Management</CardTitle>
                    <CardDescription>
                        {menuItems && Array.isArray(menuItems) ? (
                            <>
                                {
                                    menuItems.filter(
                                        (item) =>
                                            item.is_available && item.is_active
                                    ).length
                                }{" "}
                                of{" "}
                                {
                                    menuItems.filter((item) => item.is_active)
                                        .length
                                }{" "}
                                items available
                            </>
                        ) : (
                            "No menu items available"
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!menuItems ||
                    !Array.isArray(menuItems) ||
                    menuItems.filter((item) => item.is_active).length === 0 ? (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>
                                {!menuItems || !Array.isArray(menuItems)
                                    ? "Loading menu items..."
                                    : "No menu items added yet"}
                            </p>
                            <p className="text-sm">
                                {!menuItems || !Array.isArray(menuItems)
                                    ? "Please wait while we fetch the menu"
                                    : "Use the form above to add your first menu item"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">
                                            Item
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Category
                                        </th>
                                        <th className="text-right p-3 font-medium">
                                            Price
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Description
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Status
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Availability
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Delete
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menuItems
                                        .filter((item) => item.is_active)
                                        .map((item, index) => (
                                            <tr
                                                key={
                                                    item.menu_item_id ||
                                                    `menu-item-${index}`
                                                }
                                                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="p-3 font-medium">
                                                    {item.item_name}
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-semibold">
                                                    {formatCurrency(
                                                        typeof item.price ===
                                                            "number"
                                                            ? item.price
                                                            : parseFloat(
                                                                  item.price ||
                                                                      "0"
                                                              )
                                                    )}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                    {item.description ||
                                                        "No description"}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.is_available
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        }`}
                                                    >
                                                        {item.is_available
                                                            ? "Available"
                                                            : "Unavailable"}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleAvailability(
                                                                item.menu_item_id
                                                            )
                                                        }
                                                        className="flex items-center gap-2"
                                                    >
                                                        {item.is_available ? (
                                                            <>
                                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                                                <span>
                                                                    Disable
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                                <span>
                                                                    Enable
                                                                </span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </td>
                                                <td className="p-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            deleteItem(
                                                                item.menu_item_id
                                                            )
                                                        }
                                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
