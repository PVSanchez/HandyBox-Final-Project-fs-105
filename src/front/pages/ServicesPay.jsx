import React, { useEffect, useState } from "react";
import { getAllServices } from "../services/APIservice";

const URL = import.meta.env.VITE_BACKEND_URL;

export const ServicesPay = () => {
  const [contracts, setContracts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const userData = JSON.parse(sessionStorage.getItem('user'))
        const statesRes = await fetch(`${URL}/api/service-state/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!statesRes.ok) throw new Error("No autorizado o error en servicios contratados")
        const allStates = await statesRes.json()
        const userStates = allStates.filter(s => s.client_id === userData.id)
        setContracts(userStates)
        const allServices = await getAllServices()
        setServices(allServices)
      } catch (err) {
        setError("Error al cargar los servicios contratados")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>{error}</div>
  if (!contracts.length) return <div>No hay servicios contratados.</div>

  const getServiceById = (id) => services.find(s => String(s.id) === String(id))

  return (
    <div className="services-pay-container">
      <h2>Resumen de Servicios Contratados</h2>
      <div className="payments-list row justify-content-center g-4">
        {contracts.map((contract, idx) => {
          const service = getServiceById(contract.service_id)
          return (
            <div key={contract.id || idx} className="payment-card col-12 col-md-6 col-lg-4 d-flex align-items-stretch mb-4">
              <div className="card border shadow-sm w-100 h-100 d-flex flex-column justify-content-between">
                <div className="card-body">
                  <p className="mb-2"><strong>Fecha de contratación:</strong> {contract.date_register ? new Date(contract.date_register).toLocaleString() : "-"}</p>
                  <div className="services-list row">
                    <div className="col-12 mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <img src={service?.img || "https://placeholder.pics/svg/120x80"} alt={service?.name} className="img-fluid rounded" style={{ maxWidth: '120px', maxHeight: '80px' }} />
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '1.15rem', color: '#1a202c' }}>{service ? service.name : `Servicio ID: ${contract.service_id}`}</div>
                          <div>Cantidad: <strong>{contract.hours} horas</strong></div>
                          <div>Estado: <strong>{contract.status}</strong></div>
                          <div>Profesional: <strong>{contract.profesional?.user_name || contract.profesional_id}</strong></div>
                          <div>Última modificación: <strong>{contract.date_modify ? new Date(contract.date_modify).toLocaleString() : '-'}</strong></div>
                        </div>
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


