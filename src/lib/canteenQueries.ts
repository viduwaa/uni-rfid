import { pool } from "./db";
import {
    CanteenItem,
    MenuItem, // Make sure this is imported
    Student,
    Transaction,
    TransactionItem,
    TransactionRequest,
    BalanceUpdate,
    BalanceHistory,
    DailySummary,
    NFCData,
    ApiResponse,
} from "@/types/canteen";

// Helper function for updating balance
export const updateBalance = async (
    userId: string,
    amount: number,
    description?: string,
    cardUID?: string | null
): Promise<ApiResponse<BalanceUpdate>> => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Get current balance and card info
        const cardResult = await client.query(
            `
            SELECT balance, card_uid 
            FROM rfid_cards 
            WHERE assigned_student = $1 AND status = 'ACTIVE'
        `,
            [userId]
        );

        if (cardResult.rows.length === 0) {
            throw new Error("No active card found for student");
        }

        const currentBalance = parseFloat(cardResult.rows[0].balance);
        const studentCardUID = cardResult.rows[0].card_uid;
        const newBalance = currentBalance + parseFloat(amount.toString());

        if (newBalance < 0) {
            throw new Error("Insufficient balance");
        }

        // Update balance
        await client.query(
            `UPDATE rfid_cards 
             SET balance = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE assigned_student = $2 AND status = 'ACTIVE'`,
            [newBalance, userId]
        );

        // Record balance history
        await client.query(
            `INSERT INTO balance_history (student_id, card_id, amount, balance_before, balance_after, description)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                userId,
                cardUID || studentCardUID,
                parseFloat(amount.toString()),
                currentBalance,
                newBalance,
                description || "Balance update",
            ]
        );

        await client.query("COMMIT");

        return {
            success: true,
            data: {
                user_id: userId,
                balance: newBalance,
                previous_balance: currentBalance,
                amount_changed: parseFloat(amount.toString()),
            },
            message: "Balance updated successfully",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Insert new menu item
export const insertMenuItems = async (item: CanteenItem): Promise<MenuItem> => {
    const client = await pool.connect();
    try {
        console.log("Attempting to insert item:", item);

        // First, let's try a simple test query
        const testQuery = await client.query("SELECT NOW()");
        console.log("Database connection works:", testQuery.rows[0]);

        // Check if the category is valid
        const validCategories = await client.query(`
      SELECT unnest(enum_range(NULL::food_category)) as category_values;
    `);
        console.log("Valid categories:", validCategories.rows);

        // Now try the actual insert
        const result = await client.query(
            `INSERT INTO menu_items (name, category, price, description, is_active, is_available) 
       VALUES ($1, $2::food_category, $3, $4, TRUE, FALSE) 
       RETURNING id as menu_item_id, name as item_name, category, price, description, is_available, is_active, created_at, updated_at`,
            [item.name, item.category, item.price, item.description || null]
        );

        console.log("Insert successful:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Detailed database error:", {
            message: (error as any).message,
            code: (error as any).code,
            detail: (error as any).detail,
            hint: (error as any).hint,
            position: (error as any).position,
            query: (error as any).query,
        });
        throw error;
    } finally {
        client.release();
    }
};

// Get all menu items
export const getAllMenuItems = async (
    availableOnly: boolean = false
): Promise<MenuItem[]> => {
    const client = await pool.connect();
    try {
        let query =
            "SELECT id as menu_item_id, name as item_name, category, price, description, is_available, is_active, created_at, updated_at FROM menu_items WHERE is_active = TRUE";
        if (availableOnly) {
            query += " AND is_available = TRUE";
        }
        query += " ORDER BY category, name";

        console.log("Executing query:", query); // Add this for debugging
        const result = await client.query(query);
        console.log("Query result count:", result.rows.length); // Add this for debugging
        console.log("Sample menu item:", result.rows[0]); // Add this for debugging

        return result.rows;
    } catch (error) {
        console.error("Database error in getAllMenuItems:", error);
        throw error;
    } finally {
        client.release();
    }
};
// Update menu item availability
export const updateMenuItemAvailability = async (
    id: string,
    is_available: boolean
): Promise<MenuItem> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE menu_items 
       SET is_available = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND is_active = TRUE 
       RETURNING *`,
            [is_available, id]
        );

        if (result.rows.length === 0) {
            throw new Error("Menu item not found");
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Delete menu item (soft delete by setting is_active to false)
export const deleteMenuItem = async (id: string): Promise<MenuItem> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE menu_items 
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_active = TRUE 
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new Error("Menu item not found or already deleted");
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Get student by card UID
export const getStudentByCardUID = async (
    cardUID: string
): Promise<Student | null> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `
            SELECT 
                s.user_id,
                s.register_number,
                s.full_name,
                s.email,
                s.faculty,
                r.card_uid,
                r.balance,
                r.status as card_status
            FROM rfid_cards r
            JOIN students s ON r.assigned_student = s.user_id
            WHERE r.card_uid = $1 AND r.status = 'ACTIVE'
        `,
            [cardUID]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Get student by register number
export const getStudentByRegisterNumber = async (
    registerNumber: string
): Promise<Student | null> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `
            SELECT 
                s.user_id,
                s.register_number,
                s.full_name,
                s.email,
                s.faculty,
                r.card_uid,
                r.balance,
                r.status as card_status
            FROM students s
            LEFT JOIN rfid_cards r ON r.assigned_student = s.user_id AND r.status = 'ACTIVE'
            WHERE s.register_number = $1
        `,
            [registerNumber]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Get student balance
export const getStudentBalance = async (
    userId: string
): Promise<ApiResponse<Student>> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `
            SELECT 
                s.register_number,
                s.full_name,
                r.balance,
                r.card_uid
            FROM students s
            JOIN rfid_cards r ON r.assigned_student = s.user_id
            WHERE s.user_id = $1 AND r.status = 'ACTIVE'
        `,
            [userId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Student not found or no active card",
            };
        }

        return {
            success: true,
            data: result.rows[0],
        };
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Create transaction - SINGLE VERSION
export const createTransaction = async (
    transactionData: TransactionRequest
): Promise<ApiResponse<Transaction>> => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const {
            student_id,
            card_uid,
            items,
            payment_method = "card",
            manual_payment_amount,
        } = transactionData;

        // Generate transaction ID
        const transactionId = "TXN-" + Date.now();

        // Calculate total amount and validate menu items
        let totalAmount = 0;
        const menuItemIds = items.map((item) => item.menu_item_id);

        console.log("Looking for menu item IDs:", menuItemIds);

        const menuResult = await client.query(
            "SELECT id, price, name FROM menu_items WHERE id = ANY($1::uuid[]) AND is_available = TRUE AND is_active = TRUE",
            [menuItemIds]
        );

        console.log("Found menu items:", menuResult.rows);

        const menuMap = new Map(
            menuResult.rows.map((item) => [item.id, parseFloat(item.price)])
        );

        console.log("Menu map:", Array.from(menuMap.entries()));

        for (const item of items) {
            if (!menuMap.has(item.menu_item_id)) {
                console.error(
                    `Menu item ${item.menu_item_id} not found. Available IDs:`,
                    Array.from(menuMap.keys())
                );
                throw new Error(
                    `Menu item ${item.menu_item_id} not found or unavailable`
                );
            }
            const price = menuMap.get(item.menu_item_id)!;
            totalAmount += price * item.quantity;
        }

        // Check student balance
        const balanceResult = await client.query(
            `
            SELECT r.balance, r.card_uid, s.register_number, s.full_name
            FROM rfid_cards r 
            JOIN students s ON r.assigned_student = s.user_id
            WHERE r.assigned_student = $1 AND r.status = 'ACTIVE'
        `,
            [student_id]
        );

        if (balanceResult.rows.length === 0) {
            throw new Error("Student not found or no active card");
        }

        const currentBalance = parseFloat(balanceResult.rows[0].balance);
        const studentCardUID = balanceResult.rows[0].card_uid;

        // For card payments, check balance. For manual payments, skip balance check
        if (payment_method === "card" && currentBalance < totalAmount) {
            throw new Error("Insufficient balance");
        }

        // Determine payment amount and description based on payment method
        const paymentAmount =
            payment_method === "manual"
                ? manual_payment_amount || 0
                : totalAmount;
        const paymentDescription =
            payment_method === "manual"
                ? `Manual payment - ${items.length} items (Paid: Rs.${paymentAmount})`
                : `Canteen purchase - ${items.length} items`;

        // Create canteen transaction
        const transactionResult = await client.query(
            `INSERT INTO canteen_transactions 
             (transaction_id, student_id, card_id, amount, status, description)
             VALUES ($1, $2, $3, $4, 'completed', $5) RETURNING *`,
            [
                transactionId,
                student_id,
                card_uid || studentCardUID,
                paymentAmount, // Use payment amount instead of total
                paymentDescription,
            ]
        );

        const transaction = transactionResult.rows[0];

        // Add transaction items
        for (const item of items) {
            const price = menuMap.get(item.menu_item_id)!;
            await client.query(
                `INSERT INTO canteen_transaction_items 
                 (transaction_id, menu_item_id, quantity, unit_price, total_price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    transaction.id,
                    item.menu_item_id,
                    item.quantity,
                    price,
                    price * item.quantity,
                ]
            );
        }

        // Update student balance and record history only for card payments
        if (payment_method === "card") {
            const newBalance = currentBalance - totalAmount;
            await client.query(
                "UPDATE rfid_cards SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE assigned_student = $2",
                [newBalance, student_id]
            );

            // Record balance history for card payments
            await client.query(
                `INSERT INTO balance_history (student_id, card_id, amount, balance_before, balance_after, description, transaction_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    student_id,
                    card_uid || studentCardUID,
                    -totalAmount,
                    currentBalance,
                    newBalance,
                    `Purchase: ${transactionId}`,
                    transaction.id,
                ]
            );
        } else {
            // Record balance history for manual payments (no balance deduction)
            await client.query(
                `INSERT INTO balance_history (student_id, card_id, amount, balance_before, balance_after, description, transaction_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    student_id,
                    card_uid || studentCardUID,
                    0, // No amount deducted for manual payments
                    currentBalance,
                    currentBalance, // Balance remains same
                    `Manual payment: ${transactionId}`,
                    transaction.id,
                ]
            );
        }

        await client.query("COMMIT");

        return {
            success: true,
            data: {
                ...transaction,
                items: items,
            },
            message: "Transaction completed successfully",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Get balance history
export const getBalanceHistory = async (
    userId: string,
    page: number = 1,
    limit: number = 20
): Promise<ApiResponse<BalanceHistory[]>> => {
    const client = await pool.connect();
    try {
        const offset = (page - 1) * limit;

        const result = await client.query(
            `
            SELECT 
                bh.*,
                ct.transaction_id,
                ct.description as transaction_description
            FROM balance_history bh
            LEFT JOIN canteen_transactions ct ON bh.transaction_id = ct.id
            WHERE bh.student_id = $1
            ORDER BY bh.created_at DESC
            LIMIT $2 OFFSET $3
        `,
            [userId, limit, offset]
        );

        const countResult = await client.query(
            "SELECT COUNT(*) as total FROM balance_history WHERE student_id = $1",
            [userId]
        );

        return {
            success: true,
            data: result.rows,
            pagination: {
                page: page,
                limit: limit,
                total: parseInt(countResult.rows[0].total),
                pages: Math.ceil(countResult.rows[0].total / limit),
            },
        };
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Get daily summary
export const getDailySummary = async (
    date?: string
): Promise<ApiResponse<DailySummary>> => {
    const client = await pool.connect();
    try {
        const targetDate = date || new Date().toISOString().split("T")[0];

        const result = await client.query(
            "SELECT * FROM daily_sales WHERE date = $1",
            [targetDate]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "No data found for the specified date",
            };
        }

        return {
            success: true,
            data: result.rows[0],
        };
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

// Write NFC card data
export const writeCardData = async (nfcData: NFCData): Promise<void> => {
    // This would typically interface with your NFC reader hardware
    // For now, we'll just log the data that would be written
    console.log("Writing NFC card data:", nfcData);

    // In a real implementation, this would send data to your NFC reader
    // Example: await nfcReader.write(nfcData);

    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
};

// Get transaction history
export const getTransactionHistory = async (
    studentId?: string | null,
    page: number = 1,
    limit: number = 50
): Promise<ApiResponse<Transaction[]>> => {
    const client = await pool.connect();
    try {
        const offset = (page - 1) * limit;

        let query = `
      SELECT 
        ct.*,
        s.full_name,
        s.register_number,
        array_agg(
          json_build_object(
            'menu_item_id', cti.menu_item_id,
            'quantity', cti.quantity,
            'unit_price', cti.unit_price,
            'total_price', cti.total_price,
            'item_name', mi.name
          )
        ) as items
      FROM canteen_transactions ct
      JOIN students s ON ct.student_id = s.user_id
      LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
      LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
    `;

        const params: any[] = [];

        if (studentId) {
            query += ` WHERE ct.student_id = $1`;
            params.push(studentId);
        }

        query += `
      GROUP BY ct.id, s.full_name, s.register_number
      ORDER BY ct.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(limit, offset);

        const result = await client.query(query, params);

        // Get total count
        let countQuery =
            "SELECT COUNT(*) as total FROM canteen_transactions ct";
        const countParams: any[] = [];

        if (studentId) {
            countQuery += " WHERE ct.student_id = $1";
            countParams.push(studentId);
        }

        const countResult = await client.query(countQuery, countParams);

        return {
            success: true,
            data: result.rows,
            pagination: {
                page: page,
                limit: limit,
                total: parseInt(countResult.rows[0].total),
                pages: Math.ceil(countResult.rows[0].total / limit),
            },
        };
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};
