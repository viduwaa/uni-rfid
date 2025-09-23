import { NextRequest, NextResponse } from "next/server";
import { insertMenuItems } from "@/lib/canteenQueries";
import { CanteenItem } from "@/types/canteen";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received data:', body);
        
        const { name, category, price, description }: CanteenItem = body;

        // Validate category
        const validCategories = ['Main', 'Snack', 'Drink', 'Dessert'];
        if (!validCategories.includes(category)) {
            return NextResponse.json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            }, { status: 400 });
        }

        if (!name || !category || !price) {
            return NextResponse.json({
                success: false,
                message: 'Name, category, and price are required'
            }, { status: 400 });
        }

        const result = await insertMenuItems({ 
            name: name.trim(), 
            category, 
            price: parseFloat(price.toString()), 
            description: description?.trim() 
        });
        
        console.log('Database result:', result);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Menu item created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to create menu item",
            error: (error as Error).message,
        }, { status: 500 });
    }
}