import React from "react";
import Dashboard from "./views/Dashboard";
import UserProfile from "./views/UserProfile";
import Users from "./views/Users";
import Cargas from "./views/Cargas";
import Maps from "./views/Maps";
import Units from "./views/Units";
import Trailers from "./views/Trailers";


export interface DashboardRoute {
  upgrade?: boolean;
  redirect?: boolean;
  path: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  layout: string;
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
    icon: "nc-icon nc-circle-09",
    component: Users,
    layout: "/admin"
  },
   {
    path: "/unidades",
    name: "Unidades/Vehiculos",
    icon: "nc-icon nc-circle-09",
    component: Units,
    layout: "/admin"
  },
   {
    path: "/trailers",
    name: "Trailers/Cajas",
    icon: "nc-icon nc-circle-09",
    component: Trailers,
    layout: "/admin"
  },
  {
    path: "/cargas",
    name: "Cargas",
    icon: "nc-icon nc-delivery-fast",
    component: Cargas,
    layout: "/admin"
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