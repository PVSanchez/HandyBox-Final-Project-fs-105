import React, {useState, useEffect} from 'react'

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
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Servicio añadido al carrito');
    };

    return (
        <div className="d-flex flex-wrap justify-content-center gap-3">
            {services.map((service) => (
                <div key={service.id} className="card" style={{ width: "18rem" }}>
                    <img src={service.img || "https://placeholder.pics/svg/300x200"} className="card-img-top" alt={service.name} />
                    <div className="card-body">
                        <div className="card-text">{service.user_id} </div>
                        <h5 className="card-title">{service.name}</h5>
                        <p className="card-text">{service.description}</p>
                        <a className="custom-btn-1 ms-2">Ver más</a>
                        <button className="custom-btn ms-2" onClick={() => addToCart(service)}>Añadir al carrito</button>
                    </div>
                </div>
            ))}
        </div>
    )
}