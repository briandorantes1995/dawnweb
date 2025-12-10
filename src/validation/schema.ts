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

export const LoadSchema = (tieneUnidadesPropias: boolean) => Yup.object().shape({
  folio: Yup.string().required("Folio de carga es requerido"),
  tipoTransporte: tieneUnidadesPropias
    ? Yup.string().required("Tipo de transporte es requerido")
    : Yup.string().optional(),
  empresaTransportista: tieneUnidadesPropias
    ? Yup.string().when("tipoTransporte", {
        is: "empresa_transport",
        then: (schema) => schema.required("Empresa transportista es requerida"),
        otherwise: (schema) => schema.optional(),
      })
    : Yup.string().required("Empresa transportista es requerida"),
  unidadPropia: Yup.string().when("tipoTransporte", {
    is: "unidades_propias",
    then: (schema) => schema.required("Unidad propia es requerida"),
    otherwise: (schema) => schema.optional(),
  }),
  tipoCarga: Yup.string().required("Tipo de carga es requerido"),
  tipoVehiculo: Yup.string().required("Tipo de vehículo es requerido"),
  tipoCargaTransporte: Yup.string().required("Tipo de carga (seco/congelado/combinado) es requerido"),
  origen: Yup.string().required("Origen es requerido"),
  destino: Yup.string().when("tipoCarga", {
    is: "viaje_propio",
    then: (schema) => schema.required("Destino es requerido"),
    otherwise: (schema) => schema.optional(),
  }),
  nombreCliente: Yup.string().when("tipoCarga", {
    is: "cliente",
    then: (schema) => schema.required("Nombre del cliente es requerido"),
    otherwise: (schema) => schema.optional(),
  }),
  linkUbicacionCliente: Yup.string().optional(),
  descripcion: Yup.string().required("Descripción de la carga es requerida"),
  peso: Yup.string().optional(),
  volumen: Yup.string().optional(),
  fechaCarga: Yup.string().required("Fecha de carga es requerida"),
  horaCarga: Yup.string().required("Hora de carga es requerida"),
  fechaEntrega: Yup.string().required("Fecha de entrega es requerida"),
  horaEntrega: Yup.string().required("Hora de entrega es requerida"),
  contactoOrigen: Yup.string().optional(),
  contactoDestino: Yup.string().optional(),
  observaciones: Yup.string().optional(),
});

