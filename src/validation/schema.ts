import * as Yup from "yup";

export const ProfileSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    phone: Yup.string().required("Phone is required"),
  });