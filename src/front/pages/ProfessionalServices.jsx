import React, { useEffect, useState } from "react";
import "../style/ProfessionalServices.css"; 

const URL = import.meta.env.VITE_BACKEND_URL;

export const ProfessionalServices = () => {
    const [contracts, setContracts] = useState([]);
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
                const response = await fetch(`${URL}/api/service-state/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "No autorizado o error en contratos")
                }
                const data = await response.json()
                const filtered = data.filter(item => item.profesional_id === userData.id)
                setContracts(filtered)
            } catch (err) {
                setError(err.message || "Error al cargar los servicios contratados")
            } finally {
                setLoading(false)
            }
        }
        fetchContracts()
    }, [])

    const handleChangeStatus = async (serviceStateId, newStatus) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${URL}/api/service-state/${serviceStateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('No se pudo actualizar el estado');

            const updated = contracts.map(contrated => contrated.id === serviceStateId ? { ...contrated, status: newStatus } : contrated)
            setContracts(updated)
        } catch (err) {
            alert('Error al actualizar el estado del servicio');
        }
    };

    if (loading) return <div>Cargando...</div>
    if (isProfessional === false) return <div>Acceso solo para profesionales.</div>
    if (error) return <div>{error}</div>
    if (!contracts.length) return <div>No te han contratado servicios aún.</div>

    return (
        <div className="container mt-4">
            <h2>Servicios que te han contratado</h2>
            <div className="row justify-content-center g-4">
                {contracts.map((contract, index) => {
                    const totalServicio = contract.service ? ((contract.service.price || 0) * (contract.hours || 1)) : 0;
                    return (
                        <div key={contract.id + '-' + index} className="col-12 col-sm-10 col-md-8 col-lg-6 d-flex align-items-stretch mb-4">
                            <div className="card border shadow-sm w-100 h-100 d-flex flex-column justify-content-between">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-12 mb-2">
                                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                                <img
                                                    src={contract.service?.img || "https://placeholder.pics/svg/120x80"}
                                                    alt={contract.service?.name}
                                                    className="img-fluid rounded service-img-thumb"
                                                />
                                                <div className="flex-grow-1 text-center">
                                                    <div className="fw-semibold" style={{ fontSize: '1.15rem', color: '#1a202c' }}>{contract.service ? contract.service.name : `Servicio ID: ${contract.service_id}`}</div>
                                                    {contract.client && (
                                                        <div className="mt-2"><span className="text-secondary">Contratado por:</span> <strong>{contract.client.user_name || contract.client.email}</strong></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <p className="mb-2"><strong>Fecha de contratación:</strong> {contract.date_register ? new Date(contract.date_register).toLocaleString() : "-"}</p>
                                            <div>Cantidad: <strong>{contract.hours} horas</strong></div>
                                            <div>Estado: <strong>{contract.status}</strong></div>
                                            <div>Última modificación: <strong>{contract.date_modify ? new Date(contract.date_modify).toLocaleString() : '-'}</strong></div>
                                            <div>Total abonado: <strong>{totalServicio.toFixed(2)}€</strong></div>
                                            <div className="mt-2">
                                                <label htmlFor={`status-select-${contract.id}`} className="form-label me-2">Cambiar estado:</label>
                                                <select
                                                    id={`status-select-${contract.id}`}
                                                    value={contract.status}
                                                    onChange={e => handleChangeStatus(contract.id, e.target.value)}
                                                    className="form-select form-select-sm d-inline-block w-auto"
                                                >
                                                    {["pending", "success", "in progress"].map(statusOption => (
                                                        <option key={statusOption} value={statusOption}>{statusOption}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
