import React from "react";
import Dashboard from "./views/Dashboard";
import UserProfile from "./views/UserProfile";
import Users from "./views/Users";
import Cargas from "./views/Cargas";
import BulkCargas from "./views/BulkCargas";
import Maps from "./views/Maps";
import Units from "./views/Units";
import Trailers from "./views/Trailers";
import { CompanyType } from "./types/company";

// Re-exportar para compatibilidad
export type { CompanyType };

export interface DashboardRoute {
  upgrade?: boolean;
  redirect?: boolean;
  path: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  layout: string;
  submenu?: DashboardRoute[];
  // Tipos de empresa permitidos para esta ruta. Si no se especifica, todos los tipos pueden acceder.
  allowedCompanyTypes?: CompanyType[];
}

// Lista tipada
const adminRoutes: DashboardRoute[] = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
   {
    path: "/perfil",
    name: "Perfil",
    icon: "nc-icon nc-badge",
    component: UserProfile,
    layout: "/admin"
  },
  {
    path: "/usuarios",
    name: "Usuarios",
    icon: "nc-icon nc-single-02",
    component: Users,
    layout: "/admin"
  },
   {
     path: "/unidades",
     name: "Unidades/Vehiculos",
     icon: "nc-icon nc-bus-front-12",
     component: Units,
     layout: "/admin",
     allowedCompanyTypes: ["TRANSPORTER", "BOTH"]
   },
   {
     path: "/trailers",
     name: "Trailers/Cajas",
     icon: "nc-icon nc-grid-45",
     component: Trailers,
     layout: "/admin",
     allowedCompanyTypes: ["TRANSPORTER", "BOTH"]
   },
  {
    path: "/cargas",
    name: "Cargas",
    icon: "nc-icon nc-delivery-fast",
    component: Cargas,
    layout: "/admin",
    submenu: [
      {
        path: "/cargas",
        name: "Cargas",
        icon: "nc-icon nc-delivery-fast",
        component: Cargas,
        layout: "/admin"
      },
      {
        path: "/cargas-masivas",
        name: "Cargas Masivas",
        icon: "nc-icon nc-layers",
        component: BulkCargas,
        layout: "/admin",
        allowedCompanyTypes: ["SELLER", "BOTH"]
      }
    ]
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/admin"
  },
];

export default adminRoutes;