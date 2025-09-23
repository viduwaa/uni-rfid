export interface CanteenItem {
    name: string;
    category: 'Main' | 'Snack' | 'Drink' | 'Dessert'; // Make sure these match your ENUM
    price: number;
    description?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    category: 'Main' | 'Snack' | 'Drink' | 'Dessert'; // Make sure these match your ENUM
    price: number;
    description?: string;
    is_available: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface Student {
    user_id: string;
    register_number: string;
    full_name: string;
    email: string;
    faculty: string;
    card_uid?: string;
    balance?: number;
    card_status?: string;
}

export interface TransactionItem {
    menu_item_id: string;
    quantity: number;
    unit_price?: number;
}

export interface Transaction {
    id?: string;
    transaction_id: string;
    student_id: string;
    card_uid?: string;
    amount: number;
    status: string;
    description?: string;
    items?: TransactionItem[];
    created_at?: Date;
}

export interface TransactionRequest {
    student_id: string;
    card_uid?: string | null;
    items: TransactionItem[];
}

export interface BalanceUpdate {
    user_id: string;
    balance: number;
    previous_balance: number;
    amount_changed: number;
}

export interface BalanceHistory {
    id: string;
    student_id: string;
    card_id: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
    created_at: Date;
    transaction_id?: string;
    transaction_description?: string;
}

export interface DailySummary {
    date: string;
    total_transactions: number;
    total_revenue: number;
    total_items_sold: number;
    average_transaction_value: number;
}

export interface NFCData {
    register_number: string;
    full_name: string;
    faculty: string;
    timestamp?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface CardData {
    register_number: string;
    full_name: string;
    faculty: string;
    timestamp?: number;
}

