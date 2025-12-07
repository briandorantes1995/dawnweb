// components/ui/DashboardGrid.tsx
import React from "react";

const DashboardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="row g-4">
            {children}
        </div>
    );
};

export default DashboardGrid;
