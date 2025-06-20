import React, { useState, useEffect } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";

const CheckoutForm = ({ clientSecret }) => {
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
        const sum = storedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum)
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!stripe || !elements) return
        setLoading(true)
        setErrorMsg("")
        setSuccessMsg("")

        const cardElement = elements.getElement(CardNumberElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        })

        if (error) {
            setErrorMsg(error.message);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setSuccessMsg("¡Pago realizado correctamente!")
            localStorage.setItem('lastPurchase', JSON.stringify(cart))
            localStorage.removeItem('cart')
            setCart([])
            setTimeout(() => {
                navigate("/resumen")
            }, 1500)
        } else {
            setErrorMsg("No se pudo completar el pago.")
        }
        setLoading(false)
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-5 mb-4 mb-lg-0">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h4 className="mb-3">Carrito</h4>
                            {cart.length === 0 ? (
                                <div className="alert alert-info">El carrito está vacío.</div>
                            ) : (
                                <ul className="list-group mb-3">
                                    {cart.map(item => (
                                        <li key={item.id} className="list-group-item d-flex align-items-center">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="img-thumbnail me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                            )}
                                            <div className="flex-grow-1">
                                                <span>{item.name} - ${item.price} x {item.quantity}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <h5 className="mt-3">Total: ${total}</h5>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <h4 className="mb-3">Datos de la tarjeta</h4>
                                {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                                <div className="mb-3">
                                    <label className="form-label">Número de tarjeta</label>
                                    <div className="form-control p-2">
                                        <CardNumberElement options={{ placeholder: 'Número de tarjeta' }} />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label className="form-label">Fecha de expiración</label>
                                        <div className="form-control p-2">
                                            <CardExpiryElement options={{ placeholder: 'MM/AA' }} />
                                        </div>
                                    </div>
                                    <div className="col">
                                        <label className="form-label">CVC</label>
                                        <div className="form-control p-2">
                                            <CardCvcElement options={{ placeholder: 'CVC' }} />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="custom-btn w-100" disabled={!stripe || loading}>
                                    {loading ? 'Procesando...' : 'Pagar'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;
