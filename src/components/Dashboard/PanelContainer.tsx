// components/ui/PanelContainer.tsx
import React from "react";

const PanelContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div
            className="p-4 rounded-4 shadow-lg"
            style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(0,0,0,0.1)",
                backdropFilter: "blur(12px)",
                color: "#000000"
            }}
        >
            {children}
        </div>
    );
};

export default PanelContainer;
