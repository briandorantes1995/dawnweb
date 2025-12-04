import * as Yup from "yup";

export const ProfileSchema = Yup.object().shape({
    first_name: Yup.string().required("Primer nombre es requerido"),
    last_name: Yup.string().required("Apellido es requerido"),
    phone: Yup.string().required("Telefono es requerido"),
  });

export const UnitSchema = Yup.object().shape({
  type: Yup.string().required("Tipo de unidad es requerido"),
  plates: Yup.string().optional(),
  unit_identifier: Yup.string().required("Identificador de unidad es requerido"),
  tonnage: Yup.number().typeError("Tonelaje debe ser numérico").optional(),
});

export const TrailerSchema = Yup.object().shape({
  type: Yup.string().required("Tipo de unidad es requerido"),
  volume: Yup.number().typeError("Volumen debe ser numérico").optional(),
  tonnage: Yup.number().typeError("Tonelaje debe ser numérico").optional(),
  plates: Yup.string().optional(),
  box_number: Yup.string().optional(),
  color: Yup.string().optional(),
});

