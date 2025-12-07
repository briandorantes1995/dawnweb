// components/ui/InfoRow.tsx
import React from "react";

interface Props {
    label: string;
    value: string | number | React.ReactNode;
}

const InfoRow: React.FC<Props> = ({ label, value }) => {
    return (
        <div className="d-flex justify-content-between py-2 border-bottom border-white border-opacity-10">
            <span className="text-white-50">{label}</span>
            <span className="text-white">{value}</span>
        </div>
    );
};

export default InfoRow;
