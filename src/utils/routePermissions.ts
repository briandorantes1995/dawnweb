// src/utils/routePermissions.ts
import { DashboardRoute } from "../adminRoutes";
import { CompanyType } from "../types/company";
import { Member } from "../store/slices/authSlice";

/**
 * Obtiene el tipo de empresa del usuario en formato normalizado
 */
export const getUserCompanyType = (user: Member | null): CompanyType | null => {
  if (!user?.company?.type) return null;
  const type = user.company.type.toUpperCase();
  if (type === "SELLER" || type === "TRANSPORTER" || type === "BOTH") {
    return type as CompanyType;
  }
  return null;
};

/**
 * Verifica si el usuario tiene un tipo de empresa que le permite acceder a la ruta
 */
export const canAccessRoute = (
  route: DashboardRoute,
  userCompanyType: CompanyType | null
): boolean => {
  // Si la ruta no especifica restricciones de tipo de empresa, todos pueden acceder
  if (!route.allowedCompanyTypes || route.allowedCompanyTypes.length === 0) {
    return true;
  }

  // Si el usuario no tiene tipo de empresa, no puede acceder a rutas restringidas
  if (!userCompanyType) {
    return false;
  }

  // Verificar si el tipo de empresa del usuario está en la lista permitida
  return route.allowedCompanyTypes.includes(userCompanyType);
};

/**
 * Filtra un array de rutas según el tipo de empresa del usuario
 * También filtra recursivamente los submenús
 */
export const filterRoutesByCompanyType = (
  routes: DashboardRoute[],
  userCompanyType: CompanyType | null
): DashboardRoute[] => {
  return routes
    .filter((route) => canAccessRoute(route, userCompanyType))
    .map((route) => {
      // Si la ruta tiene submenú, también filtrar el submenú
      if (route.submenu && route.submenu.length > 0) {
        return {
          ...route,
          submenu: filterRoutesByCompanyType(route.submenu, userCompanyType),
        };
      }
      return route;
    });
};

