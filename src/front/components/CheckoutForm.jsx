import React, { useState, useEffect } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { createStripePay } from "../services/APIservice";

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
        const storedCart = JSON.parse(localStorage.getItem('cart')) || []
        setCart(storedCart)
        const sum = storedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        setTotal(sum)
    }, [])


    const handleQuantityChange = (id, newQty) => {
        if (newQty < 1) return
        const updatedCart = cart.map(item =>
            item.id === id ? { ...item, quantity: newQty } : item
        )
        setCart(updatedCart)
        localStorage.setItem('cart', JSON.stringify(updatedCart))
        const sum = updatedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        setTotal(sum)
    }

    const handleRemove = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        const sum = updatedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum);
    };

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
            setErrorMsg(error.message)
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                const service_ids = cart.map(item => item.id);
                const service_quantities = cart.map(item => item.quantity);
                const payData = {
                    stripe_payment_id: paymentIntent.id,
                    service_ids,
                    service_quantities,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency.toUpperCase()
                }
                await createStripePay(payData)
            } catch (e) {
                console.error("Error registrando pago en backend:", e)
            }
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
                            <h4 className="mb-3">Servicios a pagar</h4>
                            {cart.length === 0 ? (
                                <div className="alert alert-info">No hay servicios seleccionados.</div>
                            ) : (
                                <ul className="list-group mb-3">
                                    {cart.map(item => (
                                        <li key={item.id} className="list-group-item py-3 px-2" style={{ minHeight: '80px' }}>
                                            <div className="d-flex flex-column align-items-center align-items-md-start">
                                                <div className="d-flex flex-column flex-md-row align-items-center w-100 mb-2 position-relative">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.name} className="img-thumbnail me-md-3 mb-2 mb-md-0" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                                    )}
                                                    <div className="d-flex align-items-center w-100 justify-content-between">
                                                        <div style={{ fontWeight: 500, fontSize: '1.08rem' }}>{item.name}</div>
                                                        <button type="button" className="btn btn-link btn-sm p-0 ms-2 text-danger" style={{textDecoration: 'none'}} onClick={() => handleRemove(item.id)}>
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center flex-wrap w-100 justify-content-center justify-content-md-start" style={{ fontSize: '0.97rem' }}>
                                                    <span className="me-1">Precio:</span>
                                                    <span className="fw-bold">{item.price} €</span>
                                                    <span className="mx-2">x</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                        className="form-control d-inline-block mx-1"
                                                        style={{ width: '70px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        aria-label="Cantidad de horas"
                                                    />
                                                    <span className="ms-1">horas</span>
                                                    <span className="ms-3">= <span className="fw-bold">{(item.price * item.quantity).toFixed(2)} </span> €</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <h5 className="mt-3">Total: {total} €</h5>
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
