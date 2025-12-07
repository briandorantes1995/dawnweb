// components/ui/SectionTitle.tsx
import React from "react";

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4
        className="text-white fw-bold mb-3"
        style={{ textShadow: "0 0 8px rgba(255,255,255,0.5)" }}
    >
        {children}
    </h4>
);

export default SectionTitle;
