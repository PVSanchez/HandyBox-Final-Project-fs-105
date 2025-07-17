import React from "react";

export const CardService = ({ title, description, image, price }) => (
    <div className="card shadow-sm" style={{ width: "18rem", borderRadius: "1rem" }}>
        <img src={image} className="card-img-top" alt={title} style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", height: "160px", objectFit: "cover" }} />
        <div className="card-body d-flex flex-column justify-content-between" style={{ minHeight: "180px" }}>
            <h5 className="card-title fw-bold mb-2" style={{ color: "#2a4365" }}>{title}</h5>
            <p className="card-text" style={{ color: "#555" }}>{description}</p>
            {price !== undefined && (
                <p className="card-text mt-2" style={{ color: "#2a4365", fontWeight: "bold" }}>
                    Precio: {price} €
                </p>
            )}
        </div>
    </div>
);

export const CardProfessional = ({ name, profession, image }) => (
    <div className="card shadow-sm" style={{ width: "18rem", borderRadius: "1rem" }}>
        <img src={image} className="card-img-top" alt={name} style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", height: "160px", objectFit: "cover" }} />
        <div className="card-body d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
            <h5 className="card-title fw-bold mb-2" style={{ color: "#2a4365" }}>{name}</h5>
            <p className="card-text mb-0" style={{ color: "#555" }}>{profession}</p>
        </div>
    </div>
);
