import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../services/APIservice";
import { CommentCard } from "../components/CommentCard";
import { getRatesByServiceId } from "../services/APIrates";
import { userService } from "../services/users";
import { RateModal } from "../components/RateModal";
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
                console.log(currentUser)

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
                    console.log("Pagos recibidos del backend:", payments);

                    const hasPaid = payments.some(payment => {
                        const serviceIds = payment.service_ids || [];

                        console.log("Services id en el pago:", serviceIds);

                        if (serviceIds.map(String).includes(String(id))) {
                            console.log("Stripe ID encontrado:", payment.id);
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
                className="img-fluid rounded main-media-img"
                alt="Vista principal"
            />
        ) : (
            <video
                controls
                className="main-media-video"
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
                <div className="row">
                    <div className="col-12 col-md-8">
                        <h3 className="my-3">{service.name}</h3>
                        <div className="d-flex justify-content-center">
                            <div className="media-container mx-auto">
                                {renderMainMedia()}
                            </div>
                        </div>
                        <div className="d-flex justify-content-center gap-2 my-3 flex-wrap">
                            {service.img && (
                                <div
                                    onClick={() => setSelectedMedia({ type: "image", url: service.img })}
                                    className={`media-thumbnail${selectedMedia?.url === service.img ? ' selected' : ''}`}
                                >
                                    <img
                                        src={service.img}
                                        alt="Miniatura imagen"
                                        className="media-thumbnail-img"
                                    />
                                    <i
                                        className="fa-solid fa-image media-thumbnail-icon"
                                    ></i>
                                </div>
                            )}

                            {/* Miniatura de video con ícono */}
                            {service.video && (
                                <div
                                    onClick={() => setSelectedMedia({ type: "video", url: service.video })}
                                    className={`media-thumbnail${selectedMedia?.url === service.video ? ' selected' : ''}`}
                                >
                                    <video
                                        src={service.video}
                                        muted
                                        preload="metadata"
                                        className="media-thumbnail-video"
                                    />
                                    <i
                                        className="fa-solid fa-video media-thumbnail-icon"
                                    ></i>
                                </div>
                            )}
                        </div>
                        <h3 className="my-3">Descripción</h3>
                        <p>{service.description} </p>
                        <h3 className="my-3">Comentarios</h3>
                        <div className="comment-container mx-auto">
                            <CommentCard rates={rates} />
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
                    <div className="col-12 col-md-4 mt-4 mt-md-0">
                        <h5 className="card-title my-2">Servicio ofrecido por:</h5>
                        <div className="d-flex justify-content-center">
                            <Link to={`/user-detail?id=${service.user_id}`} className="w-100 text-decoration-none text-reset">
                                <div className="card text-center align-items-center w-100 h-100">
                                    <div className="row g-0 w-100">
                                        <div className="col-12 d-flex justify-content-center mt-3">
                                            <img
                                                src={service.user.img || defaultImg}
                                                className="card-img-top rounded-circle user-profile-img"
                                                alt={`Foto de ${service.user.user_name}`}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <div className="card-body p-2">
                                                <ul className="list-group list-group-flush mb-3">
                                                    <li className="list-group-item py-2 px-2 text-primary fw-semibold">
                                                        Nombre: <span className="fw-bold text-decoration-underline">{service.user.first_name}</span>
                                                    </li>
                                                    <li className="list-group-item py-2 px-2 text-primary fw-semibold">Apellidos: {service.user.last_name}</li>
                                                    <li className="list-group-item py-2 px-2 text-primary fw-semibold">Email: {service.user.email}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="card card-body mt-3">
                            <h4 className="mb-3">Servicio a pagar</h4>
                            <ul className="list-group mb-3">
                                <li className="list-group-item border-0 p-0">
                                    <div className="row g-0 align-items-center">
                                        {service.image && (
                                            <div className="col-3 col-sm-2 d-flex justify-content-center">
                                                <img src={service.image} alt={service.name} className="img-thumbnail cart-service-img" />
                                            </div>
                                        )}
                                        <div className="col">
                                            <div className="cart-service-name">{service.name}</div>
                                            <div className="d-flex align-items-center flex-wrap cart-service-details mt-2">
                                                <span className="me-1">Precio:</span>
                                                <span className="fw-bold">{service.price} €</span>
                                                <span className="mx-2">x</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                    className="form-control d-inline-block mx-1 cart-quantity-input"
                                                    aria-label="Cantidad de horas"
                                                />
                                                <span className="ms-2">
                                                    <span className="ms-1"> horas </span>
                                                    = <span className="fw-bold">{total.toFixed(2)} €</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <h5 className="mt-3">Total: {total} €</h5>
                            <button className="custom-btn w-100 mt-3" onClick={handleAddToCart}>
                                Añadir y continuar al pago
                            </button>
                        </div>
                    </div>
                </div>
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