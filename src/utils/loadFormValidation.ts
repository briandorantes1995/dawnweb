// src/utils/loadFormValidation.ts
import toast from "react-hot-toast";

export type FormData = {
  folio: string;
  empresaTransportista: string;
  tipoTransporte: string;
  unidadPropia: string;
  tipoCarga: string;
  tipoVehiculo: string;
  tipoCargaTransporte: string;
  origen: string;
  destino: string;
  nombreCliente: string;
  linkUbicacionCliente: string;
  descripcion: string;
  peso: string;
  volumen: string;
  fechaCarga: string;
  horaCarga: string;
  fechaEntrega: string;
  horaEntrega: string;
  contactoOrigen: string;
  contactoDestino: string;
  observaciones: string;
};

export function validateLoadForm(formData: FormData, tieneUnidadesPropias: boolean): boolean {
  const camposFaltantes: string[] = [];

  if (!formData.folio.trim()) {
    camposFaltantes.push("Folio de carga");
  }
  if (tieneUnidadesPropias && !formData.tipoTransporte) {
    camposFaltantes.push("Tipo de transporte");
  }
  if (!formData.tipoCarga) {
    camposFaltantes.push("Tipo de carga");
  }
  if (!formData.tipoVehiculo) {
    camposFaltantes.push("Tipo de vehículo");
  }
  if (!formData.tipoCargaTransporte) {
    camposFaltantes.push("Tipo de carga (seco/congelado/combinado)");
  }
  if (!formData.origen.trim()) {
    camposFaltantes.push("Origen");
  }
  if (!formData.descripcion.trim()) {
    camposFaltantes.push("Descripción de la carga");
  }

  if (camposFaltantes.length > 0) {
    toast.error(`Campos obligatorios faltantes:\n${camposFaltantes.join("\n")}`);
    return false;
  }

  // Validar según el tipo de transporte
  if (tieneUnidadesPropias) {
    if (formData.tipoTransporte === "empresa_transport") {
      if (!formData.empresaTransportista) {
        toast.error("Por favor selecciona una empresa transportista");
        return false;
      }
    } else if (formData.tipoTransporte === "unidades_propias") {
      if (!formData.unidadPropia) {
        toast.error("Por favor selecciona una unidad propia");
        return false;
      }
    }
  } else {
    if (!formData.empresaTransportista) {
      toast.error("Por favor selecciona una empresa transportista");
      return false;
    }
  }

  // Validar según el tipo de carga
  if (formData.tipoCarga === "cliente") {
    if (!formData.nombreCliente.trim()) {
      toast.error("Por favor ingresa el nombre del cliente");
      return false;
    }
  } else if (formData.tipoCarga === "viaje_propio") {
    if (!formData.destino.trim()) {
      toast.error("Por favor selecciona el destino");
      return false;
    }
  }

  // Validar fechas y horas
  if (!formData.fechaCarga || !formData.horaCarga || !formData.fechaEntrega || !formData.horaEntrega) {
    toast.error("Por favor completa las fechas y horas de carga y entrega");
    return false;
  }

  return true;
}

