import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// PUT - Update student details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        const { id: studentId } = await params;
        const updateData = await request.json();

        const updateQuery = `
      UPDATE students 
      SET 
        full_name = $1,
        initial_name = $2,
        register_number = $3,
        email = $4,
        nic_no = $5,
        phone = $6,
        faculty = $7,
        year_of_study = $8,
        address = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $10
      RETURNING *
    `;

        const values = [
            updateData.full_name,
            updateData.initial_name,
            updateData.register_number,
            updateData.email,
            updateData.nic_no,
            updateData.phone,
            updateData.faculty,
            updateData.year_of_study,
            updateData.address,
            studentId,
        ];

        // Also update the users table
        const userUpdateQuery = `
      UPDATE users 
      SET 
        name = $1,
        email = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;

        await client.query("BEGIN");

        await client.query(userUpdateQuery, [
            updateData.full_name,
            updateData.email,
            studentId,
        ]);

        const result = await client.query(updateQuery, values);

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Student updated successfully",
            student: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update student",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Delete student
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        const { id: studentId } = await params;

        // Delete student (cascade will handle related records)
        const deleteQuery = `
      DELETE FROM users 
      WHERE id = $1
      RETURNING *
    `;

        const result = await client.query(deleteQuery, [studentId]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Student deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete student",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
