import React from "react";
import Dashboard from "./views/Dashboard";
import UserProfile from "./views/UserProfile";
import Users from "./views/Users";
import Cargas from "./views/Cargas";
import BulkCargas from "./views/BulkCargas";
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
  submenu?: DashboardRoute[];
}

const maestroRoutes: DashboardRoute[] = [
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: "nc-icon nc-chart-pie-35",
        component: Dashboard,
        layout: "/maestro"
    },
      {
        path: "/perfil",
        name: "Perfil",
        icon: "nc-icon nc-badge",
        component: UserProfile,
        layout: "/maestro"
    },
    {
        path: "/usuarios",
        name: "Usuarios",
        icon: "nc-icon nc-circle-09",
        component: Users,
        layout: "/maestro"
    },
        {
            path: "/unidades",
            name: "Unidades/Vehiculos",
            icon: "nc-icon nc-circle-09",
            component: Units,
            layout: "/maestro"
        },
        {
            path: "/trailers",
            name: "Trailers/Cajas",
            icon: "nc-icon nc-circle-09",
            component: Trailers,
            layout: "/maestro"
        },
    {
        path: "/cargas",
        name: "Cargas",
        icon: "nc-icon nc-delivery-fast",
        component: Cargas,
        layout: "/maestro",
        submenu: [
            {
                path: "/cargas",
                name: "Cargas",
                icon: "nc-icon nc-delivery-fast",
                component: Cargas,
                layout: "/maestro"
            },
            {
                path: "/cargas-masivas",
                name: "Cargas Masivas",
                icon: "nc-icon nc-layers",
                component: BulkCargas,
                layout: "/maestro"
            }
        ]
    },
    {
        path: "/maps",
        name: "Maps",
        icon: "nc-icon nc-pin-3",
        component: Maps,
        layout: "/maestro"
    },
];

export default maestroRoutes;
