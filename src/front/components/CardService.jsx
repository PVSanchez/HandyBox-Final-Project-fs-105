import React, {useState, useEffect} from 'react'
import { Link } from "react-router-dom";

export const CardService = ({services}) => {
  
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
            {services.map((service) => (
                <div key={service.id} className="card" style={{ width: "300px" }}>
                    <img src={service.img || "https://placeholder.pics/svg/300x200"} 
                    className="card-img-top" 
                    alt={service.name}
                    style={{ width: "300px", height: "200px", objectFit: "cover" }}  />
                    
                    <div className="card-body">
                        <h5 className="card-title">{service.name}</h5>
                        <p className="card-text">Desde {service.price}€</p>
                        <Link className="custom-btn-1 ms-2" to={`/service/${service.id}`} >Ver más</Link>
                        <button className="custom-btn ms-2" onClick={() => addToCart(service)}>Añadir al carrito</button>
                        
                    </div>
                </div>
            ))}
        </div>
    )
}