// components/ui/StatCard.tsx
import React from "react";
import DashboardCard from "./DashboardCard";

interface Props {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
}

const StatCard: React.FC<Props> = ({ label, value, icon, color = "#1e87f0" }) => {
    return (
        <DashboardCard className="text-center">
            <div className="mb-2" style={{ fontSize: "40px", color }}>{icon}</div>
            <h3 className="fw-bold" style={{ color: "#000000" }}>{value}</h3>
            <p className="m-0" style={{ color: "#666666" }}>{label}</p>
        </DashboardCard>
    );
};

export default StatCard;
