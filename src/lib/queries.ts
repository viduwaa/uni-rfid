import { StudentForm } from "@/types/student";
import { pool } from "./db";

export const insertStudent = async (
    studentForm: StudentForm,
    photoURL: string | null
) => {
    try {
        const response = await pool.query(
            `INSERT INTO students (
            full_name, 
            initial_name, 
            register_number,
            email, 
            faculty, 
            year_of_study, 
            address, 
            phone, 
            photo, 
            date_of_birth 
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
            [
                studentForm.fullName,
                studentForm.initName,
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
        return response.rows[0].id;
    } catch (error) {
        console.error("Insert to DB error",error)
        throw error;
    }
};
