export interface StudentForm {
    fullName?: string;
    initName?: string;
    registerNumber?: string;
    indexNumber?: stingr;
    email?: string;
    faculty?: string;
    yearOfStudy?: string;
    address?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    photo? : any;
    nicNumber? : string;
}

export interface BaseStudent {
  id?: string; // UUID
  user_id?: string; // UUID
  index_number?: string;
  register_number?: string;
  full_name?: string;
  initial_name?: string;
  nic_no?: string;
  email?: string;
  faculty?: string;
  year_of_study?: number;
  card_id?: string | null;
  address?: string | null;
  phone?: string | null;
  photo?: string | null;
  date_of_birth?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  credits?:string
}