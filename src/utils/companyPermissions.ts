// src/utils/companyPermissions.ts
import { Member } from "../store/slices/authSlice";

/**
 * Verifica si la empresa puede crear cargas
 * Solo SELLER o BOTH pueden crear cargas, TRANSPORTER no
 */
export const canCreateLoads = (user: Member | null): boolean => {
  if (!user?.company?.type) return false;
  const companyType = user.company.type.toUpperCase();
  return companyType === "SELLER" || companyType === "BOTH";
};

/**
 * Verifica si la empresa puede aceptar cargas
 * Solo TRANSPORTER o PROVIDER pueden aceptar cargas, SELLER y BOTH no
 */
export const canAcceptLoads = (user: Member | null): boolean => {
  if (!user?.company?.type) return false;
  const companyType = user.company.type.toUpperCase();
  return companyType === "TRANSPORTER" || companyType === "PROVIDER";
};

/**
 * Obtiene el tipo de empresa del usuario
 */
export const getCompanyType = (user: Member | null): string | null => {
  return user?.company?.type?.toUpperCase() || null;
};

/**
 * Verifica si la empresa es TRANSPORTER o PROVIDER
 */
export const isTransporterCompany = (user: Member | null): boolean => {
  return canAcceptLoads(user);
};

/**
 * Verifica si la empresa es SELLER o BOTH
 */
export const isSellerCompany = (user: Member | null): boolean => {
  return canCreateLoads(user);
};

