import { BaseStudent, StudentForm } from "@/types/student";
import { pool } from "./db";
import { LecturerForm } from "@/types/lecturers";
import { sendLoginCredentials } from "./email";
const bcrypt = require("bcrypt");

export const insertStudent = async (
    studentForm: StudentForm,
    photoURL: string | null
) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        //hash password
        const saltRounds = 10;
        const std_pw = await bcrypt.hash(studentForm.nicNumber, saltRounds);

        const checkDuplicates = await client.query(
            `SELECT register_number,email 
            FROM students 
            WHERE register_number = $1 OR email = $2`,
            [studentForm.registerNumber, studentForm.email]
        );

        if (checkDuplicates.rows.length > 0) {
            let reason = "Register number or Email address already exists";

            const error = new Error(reason);
            error.name = "Duplicate Error";
            throw error;
        }

        //insert into user table
        const userResponse = await client.query(
            `INSERT INTO users (email, name, password, role) 
             VALUES ($1, $2, $3, 'STUDENT') 
             RETURNING id`,
            [studentForm.email, studentForm.fullName, std_pw]
        );

        if (studentForm.fullName && studentForm.email && studentForm.nicNumber) {
            await sendLoginCredentials(
                studentForm.email,
                studentForm.fullName,
                studentForm.nicNumber,
                "student"
            );
        }

        const userId = userResponse.rows[0].id;

        const studentResponse = await client.query(
            `INSERT INTO students (
            user_id,
            full_name, 
            initial_name,
            nic_no, 
            register_number,
            email, 
            faculty, 
            year_of_study, 
            address, 
            phone, 
            photo, 
            date_of_birth 
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
            [
                userId,
                studentForm.fullName,
                studentForm.initName,
                studentForm.nicNumber,
                studentForm.registerNumber,
                studentForm.email,
                studentForm.faculty,
                studentForm.yearOfStudy,
                studentForm.address,
                studentForm.phoneNumber,
                photoURL,
                studentForm.dateOfBirth,
            ]
        );

        await client.query("COMMIT");

        return {
            userId: userId,
            studentId: studentResponse.rows[0].id,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Insert to DB error", error);
        throw error;
    } finally {
        client.release();
    }
};

export const insertLecturer = async (
    lecturerForm: LecturerForm,
    photoURL: string | null
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        //hash password
        const saltRounds = 10;
        const lec_pw = await bcrypt.hash(lecturerForm.nicNo, saltRounds);

        const checkDuplicates = await client.query(
            `SELECT staff_id,email 
            FROM lecturers 
            WHERE staff_id = $1 OR email = $2`,
            [lecturerForm.registerNumber, lecturerForm.email]
        );

        if (checkDuplicates.rows.length > 0) {
            let reason = "Register number or Email address already exists";

            const error = new Error(reason);
            error.name = "Duplicate Error";
            throw error;
        }

        //insert into user table
        const userResponse = await client.query(
            `INSERT INTO users (email, name, password, role) 
             VALUES ($1, $2, $3, 'LECTURER') 
             RETURNING id`,
            [lecturerForm.email, lecturerForm.fullName, lec_pw]
        );

        if (lecturerForm.fullName && lecturerForm.email && lecturerForm.nicNo) {
            await sendLoginCredentials(
                lecturerForm.email,
                lecturerForm.fullName,
                lecturerForm.nicNo,
                "lecturer"
            );
        }

        const userId = userResponse.rows[0].id;

        const lecturerResponse = await client.query(
            `INSERT INTO lecturers (
            user_id,
            staff_id, 
            nic_no,
            full_name,
            initial_name, 
            email, 
            faculty, 
            position, 
            specialization,
            address, 
            phone, 
            photo, 
            date_of_birth
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
            [
                userId,
                lecturerForm.registerNumber,
                lecturerForm.nicNo,
                lecturerForm.fullName,
                lecturerForm.initName,
                lecturerForm.email,
                lecturerForm.faculty,
                lecturerForm.position,
                lecturerForm.bio,
                lecturerForm.address,
                lecturerForm.phoneNumber,
                photoURL,
                lecturerForm.dateOfBirth,
            ]
        );

        await client.query("COMMIT");

        return {
            userId: userId,
            lecturerID: lecturerResponse.rows[0].id,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Insert to DB error", error);
        throw error;
    } finally {
        client.release();
    }
};

export const notIssued = async () => {
    const client = await pool.connect();

    try {
        const notIssuedStudents = await client.query(`
            SELECT 
                s.user_id,
                s.register_number,
                s.full_name,
                s.initial_name,
                s.nic_no,
                s.email,
                s.faculty,
                s.year_of_study,
                s.address,
                s.phone,
                s.photo,
                s.date_of_birth,
                s.created_at,
                s.updated_at
            FROM 
                students s
            LEFT JOIN 
                rfid_cards r ON s.user_id = r.assigned_student
            WHERE 
                r.assigned_student IS NULL
            ORDER BY 
                s.created_at DESC
        `);

        return notIssuedStudents.rows;
    } catch (error) {
        console.error("Database query error:", error);
        throw error; // Optionally rethrow the error for upstream handling
    } finally {
        client.release();
    }
};

export const insertCardDetails = async (cardData: BaseStudent) => {
    const client = await pool.connect();

    try {
        const cardInsertResponse = await client.query(
            `INSERT INTO rfid_cards (
                card_uid,
                assigned_student,
                assigned_date,
                status,
                balance
            )VALUES(
                $1,
                $2,
                $3,
                $4,
                $5
            )RETURNING id`,
            [
                cardData.card_id,
                cardData.user_id,
                new Date().toISOString(),
                "ACTIVE",
                cardData.credits,
            ]
        );

        return cardInsertResponse.rows[0];
    } catch (error) {
        console.error("Insert to DB error", error);
        throw error;
    } finally {
        client.release();
    }
};

export async function getUserByEmail(email: string) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            "SELECT id, email, name, password, role, created_at FROM users WHERE email = $1",
            [email]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    } finally {
        client.release();
    }
}


