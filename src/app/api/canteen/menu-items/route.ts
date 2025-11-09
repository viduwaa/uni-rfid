import { NextRequest, NextResponse } from "next/server";
import {
    getAllMenuItems,
    updateMenuItemAvailability,
    deleteMenuItem,
} from "@/lib/canteenQueries";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const availableOnly = searchParams.get("available") === "true";

        const menuItems = await getAllMenuItems(availableOnly);

        return NextResponse.json({
            success: true,
            data: menuItems,
        });
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // This endpoint could be used to refresh menu availability
        // For now, just return success
        return NextResponse.json({
            success: true,
            message: "Menu availability refreshed",
        });
    } catch (error) {
        console.error("Error refreshing menu availability:", error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { id, is_available } = await request.json();

        const updatedItem = await updateMenuItemAvailability(id, is_available);

        return NextResponse.json({
            success: true,
            data: updatedItem,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to update item" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Menu item ID is required" },
                { status: 400 }
            );
        }

        const deletedItem = await deleteMenuItem(id);

        return NextResponse.json({
            success: true,
            data: deletedItem,
            message: "Menu item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return NextResponse.json(
            {
                success: false,
                message: (error as Error).message || "Failed to delete item",
            },
            { status: 500 }
        );
    }
}
