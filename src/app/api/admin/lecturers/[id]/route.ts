import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// PUT - Update lecturer details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        const { id: lecturerId } = await params;
        const updateData = await request.json();

        const updateQuery = `
      UPDATE lecturers 
      SET 
        full_name = $1,
        initial_name = $2,
        staff_id = $3,
        email = $4,
        nic_no = $5,
        phone = $6,
        faculty = $7,
        position = $8,
        specialization = $9,
        address = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

        const values = [
            updateData.full_name,
            updateData.initial_name,
            updateData.staff_id,
            updateData.email,
            updateData.nic_no,
            updateData.phone,
            updateData.faculty,
            updateData.position,
            updateData.specialization,
            updateData.address,
            lecturerId,
        ];

        // Also update the users table
        const userUpdateQuery = `
      UPDATE users 
      SET 
        name = $1,
        email = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT user_id FROM lecturers WHERE id = $3)
    `;

        await client.query("BEGIN");

        await client.query(userUpdateQuery, [
            updateData.full_name,
            updateData.email,
            lecturerId,
        ]);

        const result = await client.query(updateQuery, values);

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Lecturer updated successfully",
            lecturer: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating lecturer:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update lecturer",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Delete lecturer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        const { id: lecturerId } = await params;

        // Get user_id first
        const getUserQuery = `SELECT user_id FROM lecturers WHERE id = $1`;
        const userResult = await client.query(getUserQuery, [lecturerId]);

        if (userResult.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lecturer not found",
                },
                { status: 404 }
            );
        }

        const userId = userResult.rows[0].user_id;

        // Delete user (cascade will handle related records)
        const deleteQuery = `DELETE FROM users WHERE id = $1`;
        await client.query(deleteQuery, [userId]);

        return NextResponse.json({
            success: true,
            message: "Lecturer deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting lecturer:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete lecturer",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
