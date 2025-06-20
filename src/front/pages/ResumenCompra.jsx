import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ResumenCompra = () => {
    const [purchased, setPurchased] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {

        const lastPurchase = JSON.parse(localStorage.getItem('lastPurchase')) || []
        setPurchased(lastPurchase)
        const sum = lastPurchase.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        setTotal(sum)
    }, [])

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="mb-4">Resumen de tu compra</h3>
                            {purchased.length === 0 ? (
                                <div className="alert alert-info">No hay productos en el resumen de compra.</div>
                            ) : (
                                <ul className="list-group mb-3">
                                    {purchased.map(item => (
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
                            <h5 className="mt-3">Total pagado: ${total}</h5>
                            <button className="custom-btn mt-3" onClick={() => navigate("/")}>Volver al inicio</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


