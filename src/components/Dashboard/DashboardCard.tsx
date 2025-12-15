// components/ui/DashboardCard.tsx
import React from "react";

interface Props {
    children: React.ReactNode;
    className?: string;
}

const DashboardCard: React.FC<Props> = ({ children, className }) => {
    return (
        <div
            className={
                "p-4 rounded-3 shadow-lg backdrop-blur-md " +
                (className ?? "")
            }
            style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#000000"
            }}
        >
            {children}
        </div>
    );
};

export default DashboardCard;
