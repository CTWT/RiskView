// src/components/CommonContainerHeader.tsx

import React from "react";
import "../components.css";

interface CommonContainerHeaderProps {
    subtitle: string;
    title: string;
    description: string;
}

const CommonContainerHeader = ({
    subtitle,
    title,
    description,
}: CommonContainerHeaderProps) => {
    return (
        <div className="common-container-header">
            <h2 className="common-container-header-subtitle">{subtitle}</h2>
            <h1 className="common-container-header-title">{title}</h1>
            <p className="common-container-header-description">{description}</p>
        </div>
    );
};

export default CommonContainerHeader;
