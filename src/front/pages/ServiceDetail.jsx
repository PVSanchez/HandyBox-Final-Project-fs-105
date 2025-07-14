import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../services/APIservice";
import { CommentCard } from "../components/CommentCard";
import { getRatesByServiceId } from "../services/APIrates";
import { userService } from "../services/users";
import { RateModal } from "../components/RateModal";
import Message from "../components/Message";
import '../style/ServiceDetail.css';

export const ServiceDetail = () => {

    const defaultImg = "https://cdn-icons-png.flaticon.com/512/149/149071.png"

    const { id } = useParams();
    const [service, setService] = useState([]);
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true)
    const [selectedMedia, setSelectedMedia] = useState([])
    const [quantity, setQuantity] = useState(1);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [userHasPaidService, setUserHasPaidService] = useState(false);
    const [stripeId, setStripeId] = useState("");
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            const data = await getServiceById(id);
            setService(data);

            if (data.img) {
                setSelectedMedia({ type: "image", url: data.img });
            } else if (data.video) {
                setSelectedMedia({ type: "video", url: data.video });
            }
            setLoading(false);
        };
        fetchService();
    }, [id]);

    const fetchRates = async () => {
        try {
            const ratesData = await getRatesByServiceId(id);
            setRates(ratesData);

        } catch (error) {
            console.error("Error al obtener las valoraciones:", error);
        }
    };

    useEffect(() => {
        fetchRates();
    }, [id]);

    useEffect(() => {
        const checkUserAndPayment = async () => {
            const userResponse = await userService.getCurrentUser();
            if (userResponse.success) {
                setCurrentUser(userResponse.data);


                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const token = sessionStorage.getItem('token');

                try {
                    const response = await fetch(`${backendUrl}api/stripe-pay/user`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const payments = await response.json();


                    const hasPaid = payments.some(payment => {
                        const serviceIds = payment.service_ids || [];



                        if (serviceIds.map(String).includes(String(id))) {

                            setStripeId(payment.id); // 💡 Aquí se guarda el ID correcto
                            return true;
                        }
                        return false;
                    });
                    setUserHasPaidService(hasPaid);
                } catch (error) {
                    console.error('Error al comprobar pagos del usuario:', error);
                }
            }
        };

        checkUserAndPayment();
    }, [id]);


    //Actualización dinámica del precio
    useEffect(() => {
        if (service.price) {
            setTotal(service.price * quantity);
        }
    }, [service.price, quantity]);

    const renderMainMedia = () => {
        if (!selectedMedia) return service.img;

        return selectedMedia.type === "image" ? (
            <img
                src={selectedMedia.url}
                className="img-fluid rounded"
                alt="Vista principal"
                style={{ maxWidth: '800px', width: '100%', height: '400px', objectFit: 'contain' }}
            />
        ) : (
            <video
                controls
                style={{ maxWidth: '800px', width: '100%', height: '400px', objectFit: 'contain' }}
            >
                <source src={selectedMedia.url} type="video/mp4" />
                Tu navegador no soporta video.
            </video>
        );
    };

    const handleAddToCart = () => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingIndex = storedCart.findIndex(item => item.id === service.id);
        if (existingIndex !== -1) {
            // Si ya existe, actualiza cantidad
            storedCart[existingIndex].quantity += quantity;
        } else {
            // Si no existe, lo agrega
            storedCart.push({
                id: service.id,
                name: service.name,
                price: service.price,
                quantity: quantity,
                image: service.img || "",
            });
        }

        localStorage.setItem('cart', JSON.stringify(storedCart));
        window.dispatchEvent(new Event('cartChanged'));
        navigate("/payment/:totalAmount/:currency");
    };

    return (
        <div className="container">
            {loading ? (
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>) : (
                <>
                    <div className="row">
                        <div className="col-12 col-md-8">
                            <h3 className="my-3">{service.name}</h3>
                            <div className="d-flex">
                                {renderMainMedia()}
                            </div>
                            <div className="d-flex justify-content-center gap-2 my-3">
                                {service.img && (
                                    <div
                                        onClick={() => setSelectedMedia({ type: "image", url: service.img })}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            cursor: 'pointer',
                                            border: selectedMedia?.url === service.img ? '2px solid blue' : '1px solid #ccc',
                                            overflow: 'hidden',
                                            borderRadius: '8px',
                                            position: 'relative'
                                        }}
                                    >
                                        <img
                                            src={service.img}
                                            alt="Miniatura imagen"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <i
                                            className="fa-solid fa-image"
                                            style={{
                                                position: 'absolute',
                                                bottom: '6px',
                                                right: '6px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                padding: '6px',
                                                borderRadius: '50%',
                                                fontSize: '16px',
                                                color: '#333'
                                            }}
                                        ></i>
                                    </div>
                                )}
                                {service.video && (
                                    <div
                                        onClick={() => setSelectedMedia({ type: "video", url: service.video })}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            cursor: 'pointer',
                                            border: selectedMedia?.url === service.video ? '2px solid blue' : '1px solid #ccc',
                                            overflow: 'hidden',
                                            borderRadius: '8px',
                                            position: 'relative'
                                        }}
                                    >
                                        <video
                                            src={service.video}
                                            muted
                                            preload="metadata"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <i
                                            className="fa-solid fa-video"
                                            style={{
                                                position: 'absolute',
                                                bottom: '6px',
                                                right: '6px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                padding: '6px',
                                                borderRadius: '50%',
                                                fontSize: '16px',
                                                color: '#333'
                                            }}
                                        ></i>
                                    </div>
                                )}
                            </div>
                            <h3 className="my-3">Descripción</h3>
                            <p>{service.description} </p>
                            <h3 className="my-3">Comentarios</h3>
                            <div className="comment-list">
                                <CommentCard rates={rates} alignLeft={true} />
                            </div>
                            {currentUser && userHasPaidService && (
                                <div className="text-center my-3">
                                    <button
                                        className="custom-btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#rateModal"
                                    >
                                        Dejar valoración
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="col-12 col-md-4">
                            <h5 className="card-title my-2">Servicio ofrecido por:</h5>
                            <div className="d-flex justify-content-center mb-3">
                                <Link to={`/user-detail?id=${service.user_id}`} className="w-100" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card text-center align-items-center w-100 mb-3">
                                        <img
                                            src={service.user.img || defaultImg}
                                            className="card-img-top mt-3 img-fluid"
                                            alt={`Foto de ${service.user.user_name}`}
                                            style={{ borderRadius: "50%", maxWidth: "150px", width: "100%", height: "auto" }}
                                        />
                                        <div className="card-body">
                                            <ul className="list-group list-group-flush mb-3">
                                                <li className="list-group-item py-3 px-2 text-primary fw-semibold">
                                                    Nombre: <span className="fw-bold text-decoration-underline">{service.user.first_name}</span>
                                                </li>
                                                <li className="list-group-item py-3 px-2 text-primary fw-semibold">Apellidos: {service.user.last_name}</li>
                                                <li className="list-group-item py-3 px-2 text-primary fw-semibold">Email: {service.user.email}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="card card-body w-100 mb-3">
                                <h4 className="mb-3">Servicio a pagar</h4>
                                <ul className="list-group mb-3">
                                    <div className="d-flex flex-column align-items-center align-items-md-start w-100">
                                        <div className="d-flex flex-column flex-md-row align-items-center w-100 mb-2 position-relative">
                                            {service.image && (
                                                <img src={service.image} alt={service.name} className="img-thumbnail me-md-3 mb-2 mb-md-0 img-fluid" style={{ maxWidth: '60px', borderRadius: '6px' }} />
                                            )}
                                            <div className="d-flex align-items-center w-100 justify-content-between">
                                                <div className="fw-semibold" style={{ fontSize: '1.08rem' }}>{service.name}</div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center flex-wrap w-100 justify-content-center justify-content-md-start">
                                            <span className="me-1">Precio:</span>
                                            <span className="fw-bold">{service.price} €</span>
                                            <span className="mx-2">x</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                className="form-control d-inline-block mx-1"
                                                style={{ width: '70px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
                                                aria-label="Cantidad de horas"
                                            />
                                            <span className="ms-3">
                                                <span className="ms-1"> horas </span>
                                                = <span className="fw-bold">{total.toFixed(2)} €</span>
                                            </span>
                                        </div>
                                    </div>
                                </ul>
                                <h5 className="mt-3">Total: {total} €</h5>
                                <button className="custom-btn w-100 mt-3" onClick={handleAddToCart}>
                                    Añadir y continuar al pago
                                </button>
                            </div>
                        </div>
                    </div>
                    {currentUser && showChat && (
                        <div className="chat-modal-overlay">
                            <div className="chat-modal-container">
                                <Message
                                    show={true}
                                    serviceId={id}
                                    professionalId={service.user_id}
                                    userId={currentUser.id}
                                    userName={currentUser.user_name}
                                    roomUserId={currentUser.id}
                                    roomUserName={currentUser.user_name}
                                />
                                <button
                                    className="chat-modal-close"
                                    onClick={() => setShowChat(false)}
                                    aria-label="Cerrar chat"
                                >&times;</button>
                            </div>
                        </div>
                    )}
                    {currentUser && !showChat && (
                        <button
                            className="floating-chat-btn"
                            onClick={() => setShowChat(true)}
                        >
                            <span role="img" aria-label="chat">💬</span>
                        </button>
                    )}
                </>
            )}
            <Link to="/services" className="custom-btn ms-2">
                Volver a servicios
            </Link>
            {/* Llama al modal */}
            <RateModal
                serviceId={id}
                clientId={currentUser?.id}
                stripeId={stripeId}
                onSuccess={fetchRates}
            />
        </div >
    )
}