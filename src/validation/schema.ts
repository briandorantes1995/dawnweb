import * as Yup from "yup";

export const ProfileSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    about: Yup.string().max(500, "Max 500 characters"),
  });