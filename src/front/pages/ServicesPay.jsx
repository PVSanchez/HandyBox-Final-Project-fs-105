import React, { useEffect, useState } from "react";
import { getAllServices } from "../services/APIservice";

const URL = import.meta.env.VITE_BACKEND_URL;

export const ServicesPay = () => {
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${URL}/api/stripe-pay/user`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        })
        if (!response.ok) throw new Error("No autorizado o error en pagos")
        const pagos = await response.json()
        setPayments(pagos)
        const allServices = await getAllServices()
        setServices(allServices);
      } catch (err) {
        setError("Error al cargar los pagos o servicios")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>{error}</div>
  if (!payments.length) return <div>No hay servicios contratados.</div>

  const user = payments[0]?.user

  const getServiceById = (id) => services.find(s => String(s.id) === String(id))

  return (
    <div className="services-pay-container">
      <h2>Resumen de Servicios Contratados</h2>
      {user && (
        <div className="user-info">
          <p><strong>Usuario:</strong> {user.name || user.email}</p>
        </div>
      )}
      <div className="payments-list row g-2">
        {payments.map((pay, idx) => (
          <div key={pay.id || idx} className="payment-card col-12 col-md-6 col-lg-4 mb-3 p-2">
            <div className="card border shadow-sm h-100" style={{ minWidth: '220px', maxWidth: '270px', margin: '0 auto', fontSize: '0.98rem' }}>
              <div className="card-body p-2">
                <p className="mb-1"><strong>Fecha:</strong> {pay.created_at ? new Date(pay.created_at).toLocaleString() : "-"}</p>
                <p className="mb-1"><strong>Total Abonado:</strong> {pay.amount} {pay.currency}</p>
                <div className="services-list row">
                  {pay.service_ids.map((serviceId, i) => {
                    const service = getServiceById(serviceId)
                    const qty = pay.service_quantities[i]
                    if (!service) return null
                    return (
                      <div key={serviceId} className="col-12 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img src={service.img || "https://placeholder.pics/svg/60x40"} alt={service.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{service.name}</div>
                            <div style={{ fontSize: '0.92rem' }}>Cantidad: <strong>{qty} horas</strong></div>
                            <div style={{ fontSize: '0.92rem' }}>Total: <strong>${(service.price * qty).toFixed(2)}</strong></div>
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


