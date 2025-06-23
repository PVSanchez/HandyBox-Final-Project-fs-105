import React, { useEffect, useState } from "react";
import { getAllServices } from "../services/APIservice";

const URL = import.meta.env.VITE_BACKEND_URL;

export const ProfessionalServices = () => {
    const [contracts, setContracts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProfessional, setIsProfessional] = useState(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = sessionStorage.getItem('token')
                const userData = JSON.parse(sessionStorage.getItem('user'))
                if (userData && userData.rol && userData.rol.type === 'professional') {
                    setIsProfessional(true)
                } else {
                    setIsProfessional(false)
                    setLoading(false)
                    return
                }
                const response = await fetch(`${URL}/api/stripe-pay/professional`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (!response.ok) throw new Error("No autorizado o error en contratos")
                const data = await response.json()
                setContracts(data)
                const allServices = await getAllServices()
                setServices(allServices)
            } catch (err) {
                setError("Error al cargar los servicios contratados")
            } finally {
                setLoading(false)
            }
        }
        fetchContracts()
    }, [])

    const getServiceById = (id) => services.find(s => String(s.id) === String(id))

    if (loading) return <div>Cargando...</div>
    if (isProfessional === false) return <div>Acceso solo para profesionales.</div>;
    if (error) return <div>{error}</div>
    if (!contracts.length) return <div>No te han contratado servicios aún.</div>

    return (
        <div className="container mt-4">
            <h2>Servicios que te han contratado</h2>
            <div className="row g-2">
                {contracts.map((contract, idx) => (
                    <div key={contract.id + '-' + idx} className="col-12 col-md-6 col-lg-4 mb-3 p-2">
                        <div className="card border shadow-sm h-100" style={{ minWidth: '220px', maxWidth: '270px', margin: '0 auto', fontSize: '0.98rem' }}>
                            <div className="card-body p-2">
                                <p className="mb-1"><strong>Fecha de contratación:</strong> {contract.created_at ? new Date(contract.created_at).toLocaleString() : "-"}</p>
                                <div className="services-list row">
                                    {contract.service_ids.map((serviceId, i) => {
                                        const service = getServiceById(serviceId);
                                        return (
                                            <div key={serviceId} className="col-12 mb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    {service && (
                                                        <img src={service.img || "https://placeholder.pics/svg/60x40"} alt={service.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{service ? service.name : `Servicio ID: ${serviceId}`}</div>
                                                        {contract.user && (
                                                            <div style={{ fontSize: '0.92rem' }}>Contratado por: <strong>{contract.user.user_name || contract.user.email}</strong></div>
                                                        )}
                                                        <div style={{ fontSize: '0.92rem' }}>Cantidad: <strong>{contract.service_quantities[i]} horas</strong></div>
                                                        <div style={{ fontSize: '0.92rem' }}>Total: <strong>${(contract.amount).toFixed(2)}</strong></div>
                                                        {/* Aquí se eliminan los botones y badges de completado */}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
