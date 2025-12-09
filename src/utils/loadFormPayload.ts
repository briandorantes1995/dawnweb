// src/utils/loadFormPayload.ts
import type { FormData } from "./loadFormValidation";
import { normalizeGoogleMapsLink } from "./googleMapsUtils";

export type LoadPayload = {
  folio: string;
  tipo_carga: string;
  origen: string;
  descripcion: string;
  fecha_carga: string;
  hora_carga: string;
  fecha_entrega: string;
  hora_entrega: string;
  tipo_transporte?: string;
  empresa_transportista_id?: string;
  destino?: string;
  nombre_cliente?: string;
  link_ubicacion_cliente?: string;
  peso?: string;
  volumen?: string;
  contacto_origen?: string;
  contacto_destino?: string;
  observaciones?: string;
};

export async function buildLoadPayload(
  formData: FormData,
  selectedTransportistaId: string | undefined,
  tieneUnidadesPropias: boolean
): Promise<LoadPayload> {
  let normalizedLink = formData.linkUbicacionCliente;
  if (normalizedLink) {
    normalizedLink = await normalizeGoogleMapsLink(normalizedLink);
  }

  // Construir descripción con tipo de carga
  let descripcion = formData.descripcion;
  if (formData.tipoCargaTransporte) {
    const tipoCargaText =
      formData.tipoCargaTransporte === "seco"
        ? "Seco"
        : formData.tipoCargaTransporte === "congelado"
        ? "Congelado"
        : "Combinado";
    
    if (formData.tipoCargaTransporte === "combinado") {
      descripcion = `${descripcion} (Carga: ${tipoCargaText}, se necesita mampara)`;
    } else {
      descripcion = `${descripcion} (Carga: ${tipoCargaText})`;
    }
  }

  const payload: LoadPayload = {
    folio: formData.folio,
    tipo_carga: formData.tipoCarga,
    origen: formData.origen,
    descripcion: descripcion,
    fecha_carga: formData.fechaCarga,
    hora_carga: formData.horaCarga,
    fecha_entrega: formData.fechaEntrega,
    hora_entrega: formData.horaEntrega,
  };

  // Campos opcionales
  if (formData.tipoTransporte === "empresa_transport" || !tieneUnidadesPropias) {
    if (selectedTransportistaId) {
      payload.empresa_transportista_id = selectedTransportistaId;
    }
  }

  // Usar tipoVehiculo si está disponible, sino usar tipoTransporte
  if (formData.tipoVehiculo) {
    payload.tipo_transporte = formData.tipoVehiculo;
  } else if (formData.tipoTransporte) {
    payload.tipo_transporte = formData.tipoTransporte;
  }

  if (formData.destino) {
    payload.destino = formData.destino;
  }

  if (formData.nombreCliente) {
    payload.nombre_cliente = formData.nombreCliente;
  }

  if (normalizedLink) {
    payload.link_ubicacion_cliente = normalizedLink;
  }

  if (formData.peso) {
    payload.peso = formData.peso;
  }

  if (formData.volumen) {
    payload.volumen = formData.volumen;
  }

  if (formData.contactoOrigen) {
    payload.contacto_origen = formData.contactoOrigen;
  }

  if (formData.contactoDestino) {
    payload.contacto_destino = formData.contactoDestino;
  }

  if (formData.observaciones) {
    payload.observaciones = formData.observaciones;
  }

  return payload;
}

