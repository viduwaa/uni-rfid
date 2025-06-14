import { StudentForm } from "@/types/student";
import { pool } from "./db";
const bcrypt = require('bcrypt');

export const insertStudent = async (
    studentForm: StudentForm,
    photoURL: string | null,
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        //hash password
        const saltRounds = 10;
        const std_pw = await bcrypt.hash(studentForm.nicNumber, saltRounds);

        const checkDuplicates = await client.query(
            `SELECT register_number,email 
            FROM students 
            WHERE register_number = $1 OR email = $2`,
            [studentForm.registerNumber, studentForm.email]
        )

        if (checkDuplicates.rows.length > 0) {
            let reason = "Register number or Email address already exists"

            const error = new Error(reason)
            error.name = "Duplicate Error"
            throw error;   
        }

        //insert into user table
        const userResponse = await client.query(
            `INSERT INTO users (email, name, password, role) 
             VALUES ($1, $2, $3, 'STUDENT') 
             RETURNING id`,
            [studentForm.email, studentForm.fullName, std_pw]
        );

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

        await client.query('COMMIT');
        
        return {
            userId: userId,
            studentId: studentResponse.rows[0].id
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Insert to DB error",error)
        throw error;
    }finally{
        client.release();
    }
};
