

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";
import "../style/buttons.css";
import { CardService, CardProfessional } from "../components/CardServiceProfessional";
import { getAllServices } from "../services/APIservice";

export const Home = () => {
  const navigate = useNavigate();

  const [services, setServices] = React.useState([]);
  const [professionals, setProfessionals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const allServices = await getAllServices();
        setServices(Array.isArray(allServices) ? allServices.slice(0, 3) : []);

        // Obtener todos los usuarios y filtrar por rol "professional" en el frontend
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backendUrl}api/user/`);
        const users = await res.json();
        const professionals = Array.isArray(users)
          ? users.filter(u => u.rol?.type === "professional").slice(0, 3)
          : [];
        setProfessionals(professionals);
      } catch (err) {
        setServices([]);
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    setSending(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${backendUrl}api/send-featured-professional`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("No se pudo enviar el correo");
      setSuccessMsg("¡Correo enviado! Pronto recibirás información para destacar tu perfil.");
      setEmail("");
    } catch (err) {
      setErrorMsg("Hubo un error al enviar el correo. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="container-fluid py-5 home-hero">
        <div className="row align-items-center justify-content-center home-hero-row">
          <div className="col-12 col-md-6 mb-4 mb-md-0 d-flex flex-column justify-content-center align-items-md-start align-items-center ps-md-5 px-4 px-md-5 home-hero-text">
            <h1 className="fw-bold mb-4 text-md-start text-center home-hero-title">
              Donde las empresas y los profesionales freelance encuentran la combinación perfecta
            </h1>
            <p className="lead text-md-start text-center mb-4 home-hero-subtitle">
              Encuentra el talento adecuado para impulsar tu proyecto
            </p>
          </div>
          <div className="col-12 col-md-6 d-flex justify-content-center align-items-center px-4 px-md-5 home-hero-img">
            <img
              src="https://res.cloudinary.com/dqwccz9vp/image/upload/ChatGPT_Image_17_jul_2025_15_17_41_yxdjra.png"
              alt="Empresas y Freelance"
              className="img-fluid"
            />
          </div>
        </div>
      </div>
      <div className="container-fluid py-5 home-freelance">
        <div className="row align-items-center justify-content-center home-freelance-row">
          <div className="col-12 col-md-6 d-flex justify-content-center align-items-center mb-4 mb-md-0 px-4 px-md-5 home-freelance-img">
            <img
              src="https://plus.unsplash.com/premium_photo-1658506859713-fbb7c55df199?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Profesional trabajando, vestida de chaqueta, mirando a cámara"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-md-start align-items-center ps-md-5 px-4 px-md-5 home-freelance-text">
            <h2 className="fw-bold mb-4 text-md-start text-center home-freelance-title">
              Una forma innovadora de colaborar.
            </h2>
            <h4 className="mb-4 text-md-start text-center home-freelance-subtitle">
              Servicios para profesionales freelance.
            </h4>
            <p className="text-md-start text-center mb-4 home-freelance-desc">
              Recibe propuestas de proyectos que se alineen con tus habilidades específicas y conéctate directamente con 90,000 clientes potenciales de diversos sectores. Con HandyBox, simplifica tu carga administrativa utilizando nuestras herramientas en línea; recibe tu pago rápidamente al finalizar cada proyecto; y disfruta de la tranquilidad de tener todos tus proyectos asegurados automáticamente. Además, nuestro equipo, dedicado a los profesionales freelance, está aquí para ayudarte a impulsar tu carrera con recursos específicos, asociaciones, eventos y formación entre iguales.
            </p>
          </div>
        </div>
      </div>
      {/* Sección de destacados */}
      <div className="container py-5 home-featured">
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="fw-bold text-center mb-4 home-featured-title">
              <a href="/services" className="home-featured-link">Servicios destacados</a>
            </h2>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              {loading ? <span>Cargando...</span> :
                services.map((service, idx) => (
                  <div
                    key={service.id || idx}
                    className="home-featured-card position-relative"
                    onClick={() => navigate(`/service/${service.id}`)}
                  >
                    <span className="home-featured-sticker" title="Destacado">
                      <span className="home-featured-star">★</span>
                      <span className="home-featured-label">Destacado</span>
                    </span>
                    <CardService
                      title={service.name}
                      description={service.description}
                      image={service.img || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"}
                      price={service.price}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <h2 className="fw-bold text-center mb-4 home-featured-title">Profesionales destacados</h2>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              {loading ? <span>Cargando...</span> :
                professionals.map((prof, idx) => (
                  <div
                    key={prof.id || idx}
                    className="home-featured-card position-relative"
                    onClick={() => navigate(`/user-detail?id=${prof.id}`)}
                  >
                    <span className="home-featured-sticker" title="Destacado">
                      <span className="home-featured-star">★</span>
                      <span className="home-featured-label">Destacado</span>
                    </span>
                    <CardProfessional
                      name={prof.first_name + " " + prof.last_name}
                      profession={prof.rol?.type || "Profesional"}
                      image={prof.img || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container py-5 home-highlight">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12 p-4 rounded shadow-lg bg-white text-center home-highlight-box">
            <h2 className="fw-bold mb-3 home-highlight-title">Destaca como Profesional</h2>
            <p className="lead mb-3 home-highlight-lead">Haz que te encuentren quienes realmente te necesitan.<br />En HandyBox, te damos la visibilidad que mereces.</p>
            <ul className="list-unstyled mb-3 text-start mx-auto home-highlight-list">
              <li>✔️ Aparecerás en los primeros resultados de búsqueda.</li>
              <li>✔️ Tu perfil contará con un sello distintivo de calidad.</li>
              <li>✔️ Generarás más confianza y atraerás más clientes.</li>
            </ul>
            <p className="mb-3 home-highlight-desc">
              🚀 Impulsa tu marca personal y consigue más oportunidades.<br />¿Estás listo para dar el siguiente paso?
            </p>
            <button className="custom-btn" onClick={() => setShowModal(true)}>Hazte profesional destacado</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal show home-modal-bg" tabIndex="-1" onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content home-modal-content">
              <div className="modal-header home-modal-header">
                <h5 className="modal-title home-modal-title">Solicita ser profesional destacado</h5>
                <button type="button" className="btn-close home-modal-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body home-modal-body">
                <p>Introduce tu correo y te enviaremos información para destacar tu perfil.</p>
                <input
                  type="email"
                  className="form-control mb-3 home-modal-input"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={sending}
                />
                {successMsg && <div className="alert alert-success home-modal-success">{successMsg}</div>}
                {errorMsg && <div className="alert alert-danger home-modal-error">{errorMsg}</div>}
              </div>
              <div className="modal-footer home-modal-footer">
                <button className="custom-btn-close" onClick={() => setShowModal(false)} disabled={sending}>Cerrar</button>
                <button className="custom-btn-send" onClick={handleSend} disabled={sending || !email}>
                  {sending ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
