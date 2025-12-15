// components/ui/SectionTitle.tsx
import React from "react";

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4
        className="fw-bold mb-3"
        style={{ color: "#000000" }}
    >
        {children}
    </h4>
);

export default SectionTitle;
