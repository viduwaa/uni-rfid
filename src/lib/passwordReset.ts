// lib/passwordReset.ts
import { pool } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export interface PasswordResetToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
    updated_at: Date;
    email?: string;
    name?: string;
}

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(
    userId: string
): Promise<string> {
    try {
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Delete any existing unused tokens for this user
        await pool.query(
            "DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = false",
            [userId]
        );

        // Create new token
        await pool.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
            [userId, token, expiresAt]
        );

        return token;
    } catch (error) {
        console.error("Error creating password reset token:", error);
        throw new Error("Failed to create password reset token");
    }
}

/**
 * Validate a password reset token
 */
export async function validateResetToken(
    token: string
): Promise<PasswordResetToken | null> {
    try {
        const result = await pool.query(
            `SELECT prt.*, u.email, u.name 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1 AND prt.used = false AND prt.expires_at > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error("Error validating reset token:", error);
        return null;
    }
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(
    token: string,
    newPassword: string
): Promise<boolean> {
    try {
        // First validate the token
        const resetData = await validateResetToken(token);
        if (!resetData) {
            return false;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        const updateResult = await pool.query(
            "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
            [hashedPassword, resetData.user_id]
        );

        if (updateResult.rowCount === 0) {
            return false;
        }

        // Mark the token as used
        await pool.query(
            "UPDATE password_reset_tokens SET used = true, updated_at = NOW() WHERE token = $1",
            [token]
        );

        return true;
    } catch (error) {
        console.error("Error resetting password:", error);
        return false;
    }
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
    try {
        await pool.query(
            "DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = true"
        );
    } catch (error) {
        console.error("Error cleaning up expired tokens:", error);
    }
}

/**
 * Get user by email for password reset
 */
export async function getUserByEmailForReset(
    email: string
): Promise<{ id: string; email: string; name: string; role: string } | null> {
    try {
        const result = await pool.query(
            "SELECT id, email, name, role FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error("Error getting user by email:", error);
        return null;
    }
}
