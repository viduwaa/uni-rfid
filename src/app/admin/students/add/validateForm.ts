import { StudentForm } from "@/types/student";

export const validateForm = (formData: FormData): StudentForm => {
    const validationErrors: StudentForm = {};

    const data = {
        fullName: formData.get("fullName") as string,
        initName: formData.get("initName") as string,
        registerNumber: formData.get("registerNumber") as string,
        email: formData.get("email") as string,
        faculty: formData.get("faculty") as string,
        yearOfStudy: formData.get("yearOfStudy") as string,
        address: formData.get("address") as string,
        phoneNumber: formData.get("phone") as string,
        dateOfBirth: formData.get("dob") as string,
        photo : formData.get("photo")
    };

    //fullname validation
    if (!data.fullName || data.fullName === "") {
        validationErrors.fullName = "Full name is required";
    } else if (data.fullName.length < 5) {
        validationErrors.fullName = "Enter proper full name";
    }

    //initial name validation
    if (!data.initName) {
        validationErrors.initName = "Initial name is required";
    } else if (data.initName.length < 5) {
        validationErrors.initName = "Enter proper initial name";
    }

    //registration number validation
    if (!data.registerNumber) {
        validationErrors.registerNumber = "Registration number is required";
    } else if (data.registerNumber.length < 5) {
        validationErrors.registerNumber = "Enter proper Registration number";
    }

    //email validation
    if (!data.email) {
        validationErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
        validationErrors.email = "Invalid email address";
    }

    //faculty validation
    if(!data.faculty || data.faculty === "Select Faculty"){
        validationErrors.faculty = "Please select a faculty"
    }

    //yearOfStudy validation
    if(!data.yearOfStudy || data.yearOfStudy === "Select year"){
        validationErrors.yearOfStudy = "Please select a study year"
    }

    //address validation
    if(!data.address){
        validationErrors.address = "Address is required"
    }else if(data.address.length < 8){
        validationErrors.address = "Enter a proper address"
    }

    //phone validation
    if(!data.phoneNumber){
        validationErrors.phoneNumber = "Phone number is required"
    }else if(data.phoneNumber.length < 9){
        validationErrors.phoneNumber = "Enter a proper phone number"
    }

    //dob validation
    if(!data.dateOfBirth){
        validationErrors.dateOfBirth = "DOB is required"
    }else{
        const today = new Date();
        const dob = new Date(data.dateOfBirth)
        const minAge = today.getFullYear() - dob.getFullYear()

        if(isNaN (dob.getTime())){
            validationErrors.dateOfBirth = "Invalid date"
        }else if ( dob > today){
            validationErrors.dateOfBirth = "DOB cannot be in future"
        }else if (minAge < 18){
            validationErrors.dateOfBirth = "DOB cannot be under 18"
        }
    }

    //photo validation
    if(data.photo instanceof File){
        if (data.photo.size > 0 && !["image/jpg","image/jpeg", "image/png", "image/gif"].includes(data.photo.type)) {
            validationErrors.photo = "Invalid file type.  Only JPEG and PNG are allowed.";
        } else if (data.photo.size > 3 * 1024 * 1024) { // 5MB limit (
            validationErrors.photo = "File size too large.  Maximum size is 3MB.";
        }
    }
 
    return validationErrors;
};
