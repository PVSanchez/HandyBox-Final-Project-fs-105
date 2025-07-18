import React, { useEffect, useState } from "react";
import { getAllMyServices, updateService, toggleServiceStatus } from "../services/APIservice";
import { Link } from "react-router-dom";

export const SelectServiceToModify = () => {
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            const data = await getAllMyServices();  // Asegúrate que este endpoint devuelve todos los servicios del usuario
            setServices(data);
        };
        fetchServices();
    }, []);



    const handleToggleStatus = async (id, currentStatus) => {
        const result = await toggleServiceStatus(id, !currentStatus);
        if (result.success) {
            setServices(prev =>
                prev.map(service =>
                    service.id === id ? { ...service, status: !currentStatus } : service
                )
            );
        } else {
            alert(result.error || "Error al cambiar estado del servicio");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Mis Servicios</h2>
            {services.length === 0 && <p>No tienes servicios aún.</p>}
            {services.map(service => (
                <div key={service.id} className="d-flex justify-content-between align-items-center border p-3 mb-3 rounded shadow-sm">
                    <div>
                        <h5>{service.name}</h5>
                        <p className="mb-0">{service.description}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <Link
                            to={`/modifyService/${service.id}`}
                            className={`btn btn-outline-primary btn-sm ${!service.status ? "disabled pointer-events-none opacity-50" : ""}`}
                            >
                            Editar
                        </Link>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={service.status}
                            onChange={() => handleToggleStatus(service.id, service.status)}
                        />
                        <label className="form-check-label">
                            {service.status ? "Activo" : "Inactivo"}
                        </label>
                    </div>
                </div>
                </div>
    ))
}
        </div >
    );
};
