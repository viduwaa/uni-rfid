import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
    const client = await pool.connect();
    try {
        // Check if table exists
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'menu_items'
            );
        `);

        // Get table structure
        const tableStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'menu_items'
            ORDER BY ordinal_position;
        `);

        // Check ENUM values
        const enumValues = await client.query(`
            SELECT unnest(enum_range(NULL::food_category)) as category_values;
        `);

        // Get existing menu items
        const existingItems = await client.query(`
            SELECT * FROM menu_items LIMIT 5;
        `);

        return NextResponse.json({
            success: true,
            data: {
                tableExists: tableExists.rows[0].exists,
                tableStructure: tableStructure.rows,
                enumValues: enumValues.rows,
                existingItems: existingItems.rows,
                totalItems: existingItems.rowCount
            }
        });
    } catch (error) {
        console.error("Debug error:", error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message,
            stack: (error as Error).stack
        }, { status: 500 });
    } finally {
        client.release();
    }
}