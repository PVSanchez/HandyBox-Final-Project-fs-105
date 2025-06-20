import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Carrito = () => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || []
        setCart(storedCart)
    }, [])

    useEffect(() => {
        const sum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        setTotal(sum)
    }, [cart])

    const removeFromCart = (id) => {
        const updatedCart = cart.filter(item => item.id !== id)
        setCart(updatedCart)
        localStorage.setItem('cart', JSON.stringify(updatedCart))
    }

    const handleCheckout = () => {
        if (cart.length === 0) return
        navigate(`/payment/${total}/EUR`)
    }

    return (
        <div className="container mt-4">
            <h2>Carrito de compra</h2>
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
                            <button onClick={() => removeFromCart(item.id)} className="custom-btn btn-sm ms-2">Eliminar</button>
                        </li>
                    ))}
                </ul>
            )}
            <h3>Total: ${total}</h3>
            <button onClick={handleCheckout} className="custom-btn" disabled={cart.length === 0}>Ir a pagar</button>
        </div>
    )
}


