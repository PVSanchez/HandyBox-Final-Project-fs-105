import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";

export const CardService = ({ services, rates }) => {

    const addToCart = (service) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.id === service.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: service.id,
                name: service.name,
                price: service.price || 0,
                quantity: 1,
                image: service.img || "https://placeholder.pics/svg/300x200"
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart))
        window.dispatchEvent(new Event('cartChanged'));
    };

    return (
        <div className="d-flex flex-wrap justify-content-center gap-3">
            {services.map((service) => {
                // Filtrar valoraciones de este servicio
                const serviceRates = rates.filter(rate => rate.service_id === service.id);

                const average =
                    serviceRates.length > 0
                        ? (serviceRates.reduce((sum, r) => sum + r.client_rate, 0) / serviceRates.length).toFixed(1)
                        : null;

                return (
                    <div key={service.id} className="card m-3" style={{ width: "350px" }}>
                        <img src={service.img || "https://placeholder.pics/svg/300x200"}
                            className="card-img-top"
                            alt={service.name}
                            style={{ width: "350px", height: "200px", objectFit: "cover" }} />

                        <div className="card-body">
                            <h5 className="card-title">{service.name}</h5>

                            <div className="d-flex justify-content-center align-items-center mb-2">
                                {serviceRates.length > 0 ? (
                                    <div className="d-flex justify-content-center align-items-center mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                style={{
                                                    fontSize: "1.3rem",
                                                    color: star <= Math.round(average) ? "#ffc107" : "#e4e5e9"
                                                }}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <span className="ms-2 text-muted">
                                            {average} ({serviceRates.length})
                                        </span>
                                    </div>
                                ) : (
                                    <span
                                        style={{
                                            fontSize: "1.3rem",
                                            color: "#e4e5e9"
                                        }}>
                                        ★★★★★
                                    </span>
                                )}
                            </div>

                            <p>{service.description}</p>
                            <p className="card-text">Desde {service.price}€</p>
                            <Link className="custom-btn-1 ms-2" to={`/service/${service.id}`} >Ver más</Link>
                            <button className="custom-btn ms-2" onClick={() => addToCart(service)}>Añadir al carrito</button>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}