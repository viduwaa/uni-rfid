// import { inserMenuItems } from "@/lib/canteenQueries";
// import { canteenItem } from "@/types/canteen";

// // Helper Functions
// const updateBalance = async (userId, amount, description, cardUID = null) => {
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');

//     // Get current balance and card info
//     const cardResult = await client.query(`
//       SELECT balance, card_uid 
//       FROM rfid_cards 
//       WHERE assigned_student = $1 AND status = 'ACTIVE'
//     `, [userId]);

//     if (cardResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return {
//         success: false,
//         message: 'Student not found or no active card'
//       };
//     }

//     const currentBalance = parseFloat(cardResult.rows[0].balance);
//     const studentCardUID = cardResult.rows[0].card_uid;
//     const newBalance = currentBalance + parseFloat(amount);

//     if (newBalance < 0) {
//       await client.query('ROLLBACK');
//       return {
//         success: false,
//         message: 'Insufficient balance'
//       };
//     }

//     // Update balance
//     await client.query(
//       `UPDATE rfid_cards 
//        SET balance = $1, updated_at = CURRENT_TIMESTAMP 
//        WHERE assigned_student = $2 AND status = 'ACTIVE'`,
//       [newBalance, userId]
//     );

//     // Record balance history
//     await client.query(
//       `INSERT INTO balance_history (student_id, card_id, amount, balance_before, balance_after, description)
//        VALUES ($1, $2, $3, $4, $5, $6)`,
//       [userId, cardUID || studentCardUID, parseFloat(amount), currentBalance, newBalance, description || 'Balance update']
//     );

//     await client.query('COMMIT');

//     return {
//       success: true,
//       data: {
//         user_id: userId,
//         balance: newBalance,
//         previous_balance: currentBalance,
//         amount_changed: parseFloat(amount)
//       },
//       message: 'Balance updated successfully'
//     };

//   } catch (error) {
//     await client.query('ROLLBACK');
//     throw error;
//   } finally {
//     client.release();
//   }
// };


// // =====================
// // API ROUTES
// // =====================

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'API server is running',
//     timestamp: Date.now(),
//     nfc_status: currentNFCStatus
//   });
// });

// // Get current NFC status via REST
// app.get('/api/nfc-status', (req, res) => {
//   res.json({
//     success: true,
//     data: currentNFCStatus
//   });
// });

// // =====================
// // MENU ITEMS ROUTES
// // =====================

// // Get all menu items
// app.get('/api/menu-items', asyncHandler(async (req, res) => {
//   const { available } = req.query;
//   let query = 'SELECT * FROM menu_items WHERE is_active = TRUE';
//   const params = [];

//   if (available === 'true') {
//     query += ' AND is_available = TRUE';
//   }

//   query += ' ORDER BY category, name';

//   const result = await pool.query(query, params);
//   res.json({
//     success: true,
//     data: result.rows
//   });
// }));

// // Create new menu item
// app.post('/api/canteen/new-item', asyncHandler(async (req, res) => {
//   const { name, category, price, description }:canteenItem = req.body;

//   if (!name || !category || !price) {
//     return res.status(400).json({
//       success: false,
//       message: 'Name, category, and price are required'
//     });
//   }

//   inserMenuItems({name, category, price, description})

//   res.status(201).json({
//     success: true,
//     data: result.rows[0],
//     message: 'Menu item created successfully'
//   });
// }));

// // Update menu item
// app.put('/api/menu-items/:id', asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, category, price, description, is_available } = req.body;

//   const result = await pool.query(
//     `UPDATE menu_items 
//      SET name = COALESCE($1, name),
//          category = COALESCE($2, category),
//          price = COALESCE($3, price),
//          description = COALESCE($4, description),
//          is_available = COALESCE($5, is_available),
//          updated_at = CURRENT_TIMESTAMP
//      WHERE id = $6 AND is_active = TRUE 
//      RETURNING *`,
//     [name, category, price ? parseFloat(price) : null, description, is_available, id]
//   );

//   if (result.rows.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'Menu item not found'
//     });
//   }

//   res.json({
//     success: true,
//     data: result.rows[0],
//     message: 'Menu item updated successfully'
//   });
// }));

// // Toggle menu item availability
// app.patch('/api/menu-items/:id/toggle', asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const result = await pool.query(
//     `UPDATE menu_items 
//      SET is_available = NOT is_available,
//          updated_at = CURRENT_TIMESTAMP
//      WHERE id = $1 AND is_active = TRUE 
//      RETURNING *`,
//     [id]
//   );

//   if (result.rows.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'Menu item not found'
//     });
//   }

//   res.json({
//     success: true,
//     data: result.rows[0],
//     message: 'Menu item availability toggled successfully'
//   });
// }));

// // Delete menu item (soft delete)
// app.delete('/api/menu-items/:id', asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const result = await pool.query(
//     `UPDATE menu_items 
//      SET is_active = FALSE,
//          updated_at = CURRENT_TIMESTAMP
//      WHERE id = $1 AND is_active = TRUE 
//      RETURNING *`,
//     [id]
//   );

//   if (result.rows.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'Menu item not found'
//     });
//   }

//   res.json({
//     success: true,
//     message: 'Menu item deleted successfully'
//   });
// }));

// // =====================
// // STUDENT ROUTES
// // =====================

// // Get student by RFID card UID
// app.get('/api/students/card/:cardUID', asyncHandler(async (req, res) => {
//   const { cardUID } = req.params;

//   const result = await pool.query(`
//     SELECT 
//       s.user_id,
//       s.register_number,
//       s.full_name,
//       s.email,
//       s.faculty,
//       r.card_uid,
//       r.balance,
//       r.status as card_status
//     FROM rfid_cards r
//     JOIN students s ON r.assigned_student = s.user_id
//     WHERE r.card_uid = $1 AND r.status = 'ACTIVE'
//   `, [cardUID]);

//   if (result.rows.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'Student not found or card inactive'
//     });
//   }

//   res.json({
//     success: true,
//     data: result.rows[0]
//   });
// }));

// // Get student balance
// app.get('/api/students/:userId/balance', asyncHandler(async (req, res) => {
//   const { userId } = req.params;

//   const result = await pool.query(`
//     SELECT 
//       s.register_number,
//       s.full_name,
//       r.balance,
//       r.card_uid
//     FROM students s
//     JOIN rfid_cards r ON r.assigned_student = s.user_id
//     WHERE s.user_id = $1 AND r.status = 'ACTIVE'
//   `, [userId]);

//   if (result.rows.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'Student not found or no active card'
//     });
//   }

//   res.json({
//     success: true,
//     data: result.rows[0]
//   });
// }));

// // Update student balance
// app.patch('/api/students/:userId/balance', asyncHandler(async (req, res) => {
//   const { userId } = req.params;
//   const { amount, description, card_uid } = req.body;

//   if (!amount) {
//     return res.status(400).json({
//       success: false,
//       message: 'Amount is required'
//     });
//   }

//   try {
//     const result = await updateBalance(userId, amount, description, card_uid);
    
//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     res.json(result);
//   } catch (error) {
//     throw error;
//   }
// }));

// // =====================
// // TRANSACTION ROUTES
// // =====================

// // Create new transaction
// app.post('/api/transactions', asyncHandler(async (req, res) => {
//   const { student_id, card_uid, items } = req.body;

//   if (!student_id || !items || !Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: 'Student ID and items array are required'
//     });
//   }

//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');

//     // Generate transaction ID
//     const transactionId = 'TXN-' + Date.now();

//     // Calculate total amount and validate menu items
//     let totalAmount = 0;
//     const menuItemIds = items.map(item => item.menu_item_id);
    
//     const menuResult = await client.query(
//       'SELECT id, price FROM menu_items WHERE id = ANY($1::uuid[]) AND is_available = TRUE AND is_active = TRUE',
//       [menuItemIds]
//     );

//     const menuMap = new Map(menuResult.rows.map(item => [item.id, parseFloat(item.price)]));

//     for (const item of items) {
//       if (!menuMap.has(item.menu_item_id)) {
//         await client.query('ROLLBACK');
//         return res.status(400).json({
//           success: false,
//           message: `Menu item ${item.menu_item_id} not available`
//         });
//       }
//       totalAmount += menuMap.get(item.menu_item_id) * item.quantity;
//     }

//     // Check student balance
//     const balanceResult = await client.query(`
//       SELECT r.balance, r.card_uid, s.register_number, s.full_name
//       FROM rfid_cards r 
//       JOIN students s ON r.assigned_student = s.user_id
//       WHERE r.assigned_student = $1 AND r.status = 'ACTIVE'
//     `, [student_id]);

//     if (balanceResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({
//         success: false,
//         message: 'Student not found or no active card'
//       });
//     }

//     const currentBalance = parseFloat(balanceResult.rows[0].balance);
//     const studentCardUID = balanceResult.rows[0].card_uid;
    
//     if (currentBalance < totalAmount) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({
//         success: false,
//         message: 'Insufficient balance',
//         data: {
//           current_balance: currentBalance,
//           required_amount: totalAmount,
//           shortage: totalAmount - currentBalance
//         }
//       });
//     }

//     // Create canteen transaction
//     const transactionResult = await client.query(
//       `INSERT INTO canteen_transactions 
//        (transaction_id, student_id, card_id, amount, status, description)
//        VALUES ($1, $2, $3, $4, 'completed', $5) RETURNING *`,
//       [transactionId, student_id, card_uid || studentCardUID, totalAmount, `Canteen purchase - ${items.length} items`]
//     );

//     const transaction = transactionResult.rows[0];

//     // Add transaction items
//     for (const item of items) {
//       const unitPrice = menuMap.get(item.menu_item_id);
//       const totalPrice = unitPrice * item.quantity;

//       await client.query(
//         `INSERT INTO canteen_transaction_items (transaction_id, menu_item_id, quantity, unit_price, total_price)
//          VALUES ($1, $2, $3, $4, $5)`,
//         [transaction.id, item.menu_item_id, item.quantity, unitPrice, totalPrice]
//       );
//     }

//     // Update student balance
//     const newBalance = currentBalance - totalAmount;
//     await client.query(
//       'UPDATE rfid_cards SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE assigned_student = $2',
//       [newBalance, student_id]
//     );

//     // Record balance history
//     await client.query(
//       `INSERT INTO balance_history (student_id, card_id, transaction_id, amount, balance_before, balance_after, description)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//       [student_id, card_uid || studentCardUID, transaction.id, -totalAmount, currentBalance, newBalance, `Purchase - ${transactionId}`]
//     );

//     // Update daily sales
//     const today = new Date().toISOString().split('T')[0];
//     await client.query(
//       `INSERT INTO daily_sales (date, total_transactions, total_revenue)
//        VALUES ($1, 1, $2)
//        ON CONFLICT (date) 
//        DO UPDATE SET 
//          total_transactions = daily_sales.total_transactions + 1,
//          total_revenue = daily_sales.total_revenue + $2,
//          updated_at = CURRENT_TIMESTAMP`,
//       [today, totalAmount]
//     );

//     await client.query('COMMIT');

//     // Get complete transaction details
//     const completeTransaction = await pool.query(`
//       SELECT 
//         ct.*,
//         s.register_number,
//         s.full_name,
//         COALESCE(
//           JSON_AGG(
//             JSON_BUILD_OBJECT(
//               'name', mi.name,
//               'category', mi.category,
//               'quantity', cti.quantity,
//               'unit_price', cti.unit_price,
//               'total_price', cti.total_price
//             ) ORDER BY cti.created_at
//           ) FILTER (WHERE mi.id IS NOT NULL), 
//           '[]'::json
//         ) as items
//       FROM canteen_transactions ct
//       JOIN students s ON ct.student_id = s.user_id
//       LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
//       LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
//       WHERE ct.id = $1
//       GROUP BY ct.id, s.register_number, s.full_name
//     `, [transaction.id]);

//     // Broadcast transaction to connected clients
//     io.emit('transaction-complete', {
//       transaction: completeTransaction.rows[0],
//       student: {
//         register_number: balanceResult.rows[0].register_number,
//         full_name: balanceResult.rows[0].full_name,
//         new_balance: newBalance
//       }
//     });

//     res.status(201).json({
//       success: true,
//       data: completeTransaction.rows[0],
//       message: 'Transaction completed successfully'
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     throw error;
//   } finally {
//     client.release();
//   }
// }));

// // Get transaction history with corrected parameter syntax
// app.get('/api/transactions', asyncHandler(async (req, res) => {
//   const { 
//     student_id, 
//     food_name, 
//     start_date, 
//     end_date, 
//     status, 
//     page = 1, 
//     limit = 50 
//   } = req.query;

//   let query = `
//     SELECT 
//       ct.id,
//       ct.transaction_id,
//       ct.student_id,
//       s.register_number,
//       s.full_name,
//       ct.amount,
//       ct.status,
//       ct.created_at,
//       COALESCE(
//         JSON_AGG(
//           JSON_BUILD_OBJECT(
//             'name', mi.name,
//             'category', mi.category,
//             'quantity', cti.quantity,
//             'unit_price', cti.unit_price,
//             'total_price', cti.total_price
//           ) ORDER BY cti.created_at
//         ) FILTER (WHERE mi.id IS NOT NULL), 
//         '[]'::json
//       ) as items
//     FROM canteen_transactions ct
//     JOIN students s ON ct.student_id = s.user_id
//     LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
//     LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
//     WHERE 1=1
//   `;

//   const params = [];
//   let paramCount = 0;

//   if (student_id) {
//     paramCount++;
//     query += ` AND s.register_number = $${paramCount}`;
//     params.push(student_id);
//   }

//   if (food_name) {
//     paramCount++;
//     query += ` AND mi.name ILIKE $${paramCount}`;
//     params.push(`%${food_name}%`);
//   }

//   if (start_date) {
//     paramCount++;
//     query += ` AND ct.created_at >= $${paramCount}`;
//     params.push(start_date);
//   }

//   if (end_date) {
//     paramCount++;
//     query += ` AND ct.created_at <= $${paramCount}`;
//     params.push(end_date + ' 23:59:59');
//   }

//   if (status) {
//     paramCount++;
//     query += ` AND ct.status = $${paramCount}`;
//     params.push(status);
//   }

//   query += `
//     GROUP BY ct.id, ct.transaction_id, ct.student_id, s.register_number, s.full_name, ct.amount, ct.status, ct.created_at
//     ORDER BY ct.created_at DESC
//   `;

//   const offset = (parseInt(page) - 1) * parseInt(limit);
//   paramCount++;
//   query += ` LIMIT $${paramCount}`;
//   params.push(parseInt(limit));

//   paramCount++;
//   query += ` OFFSET $${paramCount}`;
//   params.push(offset);

//   const result = await pool.query(query, params);

//   // Get total count for pagination
//   let countQuery = `
//     SELECT COUNT(DISTINCT ct.id) as total
//     FROM canteen_transactions ct
//     JOIN students s ON ct.student_id = s.user_id
//     LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
//     LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
//     WHERE 1=1
//   `;

//   const countParams = [];
//   let countParamCount = 0;

//   if (student_id) {
//     countParamCount++;
//     countQuery += ` AND s.register_number = $${countParamCount}`;
//     countParams.push(student_id);
//   }

//   if (food_name) {
//     countParamCount++;
//     countQuery += ` AND mi.name ILIKE $${countParamCount}`;
//     countParams.push(`%${food_name}%`);
//   }

//   if (start_date) {
//     countParamCount++;
//     countQuery += ` AND ct.created_at >= $${countParamCount}`;
//     countParams.push(start_date);
//   }

//   if (end_date) {
//     countParamCount++;
//     countQuery += ` AND ct.created_at <= $${countParamCount}`;
//     countParams.push(end_date + ' 23:59:59');
//   }

//   if (status) {
//     countParamCount++;
//     countQuery += ` AND ct.status = $${countParamCount}`;
//     countParams.push(status);
//   }

//   const countResult = await pool.query(countQuery, countParams);

//   res.json({
//     success: true,
//     data: result.rows,
//     pagination: {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       total: parseInt(countResult.rows[0].total),
//       pages: Math.ceil(countResult.rows[0].total / parseInt(limit))
//     }
//   });
// }));

// // Get daily sales summary
// app.get('/api/dashboard/daily-summary', asyncHandler(async (req, res) => {
//   const { date } = req.query;
//   const targetDate = date || new Date().toISOString().split('T')[0];

//   const result = await pool.query(
//     'SELECT * FROM daily_sales WHERE date = $1',
//     [targetDate]
//   );

//   if (result.rows.length === 0) {
//     // Calculate from transactions if daily_sales entry doesn't exist
//     const transactionResult = await pool.query(`
//       SELECT 
//         COUNT(*) as total_transactions,
//         COALESCE(SUM(amount), 0) as total_revenue
//       FROM canteen_transactions 
//       WHERE DATE(created_at) = $1 AND status = 'completed'
//     `, [targetDate]);

//     return res.json({
//       success: true,
//       data: {
//         date: targetDate,
//         total_transactions: parseInt(transactionResult.rows[0].total_transactions),
//         total_revenue: parseFloat(transactionResult.rows[0].total_revenue)
//       }
//     });
//   }

//   res.json({
//     success: true,
//     data: result.rows[0]
//   });
// }));

// // =====================
// // BALANCE MANAGEMENT ROUTES
// // =====================

// // Get balance history for a student
// app.get('/api/students/:userId/balance-history', asyncHandler(async (req, res) => {
//   const { userId } = req.params;
//   const { page = 1, limit = 20 } = req.query;

//   const offset = (parseInt(page) - 1) * parseInt(limit);

//   const result = await pool.query(`
//     SELECT 
//       bh.*,
//       ct.transaction_id,
//       ct.description as transaction_description
//     FROM balance_history bh
//     LEFT JOIN canteen_transactions ct ON bh.transaction_id = ct.id
//     WHERE bh.student_id = $1
//     ORDER BY bh.created_at DESC
//     LIMIT $2 OFFSET $3
//   `, [userId, parseInt(limit), offset]);

//   const countResult = await pool.query(
//     'SELECT COUNT(*) as total FROM balance_history WHERE student_id = $1',
//     [userId]
//   );

//   res.json({
//     success: true,
//     data: result.rows,
//     pagination: {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       total: parseInt(countResult.rows[0].total),
//       pages: Math.ceil(countResult.rows[0].total / parseInt(limit))
//     }
//   });
// }));

// // Add balance to student card (top-up)
// app.post('/api/students/:userId/topup', asyncHandler(async (req, res) => {
//   const { userId } = req.params;
//   const { amount, description = 'Balance top-up' } = req.body;

//   if (!amount || parseFloat(amount) <= 0) {
//     return res.status(400).json({
//       success: false,
//       message: 'Valid positive amount is required'
//     });
//   }

//   try {
//     const result = await updateBalance(userId, parseFloat(amount), description);
    
//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     // Broadcast balance update to connected clients
//     io.emit('balance-updated', {
//       student_id: userId,
//       new_balance: result.data.balance,
//       amount_added: parseFloat(amount)
//     });

//     res.json(result);
//   } catch (error) {
//     throw error;
//   }
// }));

// // =====================
// // NFC CARD MANAGEMENT ROUTES
// // =====================

// // Write data to NFC card via API
// app.post('/api/nfc/write-card', asyncHandler(async (req, res) => {
//   const { register_number, full_name, faculty } = req.body;

//   if (!register_number || !full_name || !faculty) {
//     return res.status(400).json({
//       success: false,
//       message: 'Register number, full name, and faculty are required'
//     });
//   }

//   // Check if student exists
//   const studentResult = await pool.query(
//     'SELECT user_id FROM students WHERE register_number = $1',
//     [register_number]
//   );

//   if (studentResult.rows.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: 'Student not found'
//     });
//   }

//   // Emit write request to NFC reader
//   const cardData = {
//     register_number,
//     full_name,
//     faculty,
//     timestamp: Date.now()
//   };

//   io.emit("write-card-data", cardData);

//   res.json({
//     success: true,
//     message: 'Write request sent to NFC reader. Please tap the card now.',
//     data: cardData
//   });
// }));

// // Global error handler
// app.use((error, req, res, next) => {
//   console.error('Error:', error);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Start server
// server.listen(port, () => {
//   console.log(`Integrated API server running on port ${port}`);
//   console.log(`Socket.IO server running on the same port`);
//   console.log(`Connected to database: ${process.env.DB_NAME || 'university_management'}`);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('Shutting down gracefully...');
//   await pool.end();
//   server.close(() => {
//     console.log('Server closed.');
//     process.exit(0);
//   });
// });

// module.exports = { app, server, io };