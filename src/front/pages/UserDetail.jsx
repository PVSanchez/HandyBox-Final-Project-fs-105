import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import "../style/UserDetail.css";

const URL = import.meta.env.VITE_BACKEND_URL;

export const UserDetail = () => {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [hover, setHover] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const params = new URLSearchParams(location.search)
    const userId = params.get("id")
    if (!userId) {
      setError("No se proporcionó el ID de usuario")
      setLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        const res = await fetch(`${URL}/api/user-detail/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("No se encontró el detalle del usuario")

        const data = await res.json()
        setDetail(data)

        const resServices = await fetch(`${URL}/api/service/users/${userId}`)

        if (resServices.ok) {
          const dataServices = await resServices.json()
          setServices(dataServices)
        }
      } catch (err) {
        setError(err.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [location.search, navigate])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setShowStickyNav(y > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) return <div className="container mt-5 text-center"><Spinner /></div>
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>
  if (!detail) return null

  return (
    <>
      {showVideoModal && detail.video && (
        <div className="modal fade show userdetail-modal-bg" tabIndex="-1" onClick={() => setShowVideoModal(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-0">
                <button type="button" className="btn-close btn-close-white ms-auto" aria-label="Close" onClick={() => setShowVideoModal(false)}></button>
              </div>
              <div className="modal-body d-flex justify-content-center">
                <video src={detail.video} controls autoPlay className="userdetail-modal-video" />
              </div>
            </div>
          </div>
        </div>
      )}
      {showStickyNav && (
        <nav className="sticky-top navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom mb-4 animate__animated animate__fadeInDown" style={{ zIndex: 1020, transition: 'all 0.3s' }}>
          <div className="container d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <img src={detail.user?.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="avatar" className="rounded-circle border border-2" width={48} height={48} />
              <div className="d-flex flex-column">
                <span className="fw-bold">{detail.user?.first_name} {detail.user?.last_name}</span>
                <span className="text-muted small">@{detail.user?.user_name}</span>
              </div>
            </div>
            <ul className="nav nav-pills gap-2 flex-wrap ms-3">
              <li className="nav-item">
                <a href="#acerca" className="nav-link text-primary fw-semibold">Acerca de mí</a>
              </li>
              <li className="nav-item">
                <a href="#experiencia" className="nav-link text-primary fw-semibold">Experiencia laboral</a>
              </li>
              <li className="nav-item">
                <a href="#servicios" className="nav-link text-primary fw-semibold">Servicios ofrecidos</a>
              </li>
              <li className="nav-item">
                <a href="#portfolio" className="nav-link text-primary fw-semibold">Portfolio</a>
              </li>
            </ul>
          </div>
        </nav>
      )}
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12 p-4 rounded shadow-lg bg-white">
            <div className="d-flex align-items-center mb-4">
              <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={`userdetail-container${detail.video ? ' userdetail-hasvideo' : ''}${detail.video ? ' userdetail-pointer' : ''}`}
                onClick={() => detail.video && setShowVideoModal(true)}
              >
                {hover && detail.video ? (
                  <div className="userdetail-border">
                    <video
                      src={detail.video}
                      className="rounded-circle userdetail-img"
                      autoPlay
                      muted
                      loop
                    />
                  </div>
                ) : (
                  detail.video ? (
                    <div className="userdetail-border">
                      <img
                        src={detail.user?.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="avatar"
                        className="rounded-circle userdetail-img"
                      />
                    </div>
                  ) : (
                    <img
                      src={detail.user?.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt="avatar"
                      className="rounded-circle border border-2 userdetail-img"
                    />
                  )
                )}
              </div>
              <div className="ms-4">
                <h3 className="mb-1">{detail.user?.first_name} {detail.user?.last_name}</h3>
                <div className="text-muted">@{detail.user?.user_name}</div>
              </div>
            </div>
            <div id="acerca" className="pt-5 border-bottom border-2">
              <h3 className="mb-3">Acerca de mí</h3>
              <p className="fs-5 mt-5">{detail.acerca_de_mi || <span className="text-muted">Sin información</span>}</p>
            </div>
            <div id="experiencia" className="pt-5 border-bottom border-2">
              <h3 className="mb-3">Experiencia laboral</h3>
              <p className="fs-5 mt-5">{detail.experiencia_laboral || <span className="text-muted">Sin información</span>}</p>
            </div>
            <div id="servicios" className="pt-5 border-bottom border-2">
              <h3 className="mb-4">Servicios ofrecidos</h3>
              {services.length === 0 ? (
                <div className="text-muted">Este profesional aún no tiene servicios publicados.</div>
              ) : (
                <div className="row g-3 mt-5 mb-5">
                  {services.map(service => (
                    <div className="col-md-6" key={service.id}>
                      <Link to={`/service/${service.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card h-100 shadow-sm">
                          {service.img && <img src={service.img} alt={service.name} className="card-img-top" style={{ maxHeight: 180, objectFit: "cover" }} />}
                          <div className="card-body">
                            <h6 className="card-title">{service.name}</h6>
                            <p className="card-text small">{service.description}</p>
                            <div className="fw-bold">Precio: ${service.price}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div id="portfolio" className="pt-5 mb-3">
              <h3 className="mb-3">Portfolio</h3>
              <p className="fs-5 mt-5">{detail.portfolio || <span className="text-muted">Sin información</span>}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
