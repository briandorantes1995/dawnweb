import React from "react";
import Dashboard from "./views/Dashboard";
import UserProfile from "./views/UserProfile";
import Users from "./views/Users";
import TableList from "./views/TableList";
import Typography from "./views/Typography";
import Icons from "./views/Icons";
import Maps from "./views/Maps";
import Notifications from "./views/Notifications";

export interface DashboardRoute {
  upgrade?: boolean;
  redirect?: boolean;
  path: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  layout: string;
}

const maestroRoutes: DashboardRoute[] = [
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: "nc-icon nc-chart-pie-35",
        component: Dashboard,
        layout: "/master"
    },
    {
        path: "/usuarios",
        name: "Usuarios",
        icon: "nc-icon nc-circle-09",
        component: Users,
        layout: "/master"
    },
    {
        path: "/table",
        name: "Table List",
        icon: "nc-icon nc-notes",
        component: TableList,
        layout: "/master"
    },
    {
        path: "/typography",
        name: "Typography",
        icon: "nc-icon nc-paper-2",
        component: Typography,
        layout: "/master"
    },
    {
        path: "/icons",
        name: "Icons",
        icon: "nc-icon nc-atom",
        component: Icons,
        layout: "/master"
    },
    {
        path: "/maps",
        name: "Maps",
        icon: "nc-icon nc-pin-3",
        component: Maps,
        layout: "/master"
    },
    {
        path: "/notifications",
        name: "Notifications",
        icon: "nc-icon nc-bell-55",
        component: Notifications,
        layout: "/master"
    },
    {
        path: "/perfil",
        name: "Perfil",
        icon: "nc-icon nc-chart-pie-35",
        component: UserProfile,
        layout: "/master"
    },
];

export default maestroRoutes;
