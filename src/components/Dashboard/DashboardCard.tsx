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
                "p-4 rounded-3 shadow-lg bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 " +
                (className ?? "")
            }
        >
            {children}
        </div>
    );
};

export default DashboardCard;
