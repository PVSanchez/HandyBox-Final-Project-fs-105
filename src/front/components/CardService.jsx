import React, {useState, useEffect} from 'react'

export const CardService = ({services}) => {

    return (
        <div className="d-flex flex-wrap justify-content-center gap-3">
            {services.map((service) => (
                <div key={service.id} className="card" style={{ width: "18rem" }}>
                    <img src={service.img || "https://placeholder.pics/svg/300x200"} className="card-img-top" alt={service.name} />
                    <div className="card-body">
                        <div className="card-text">{service.user_id} </div>
                        <h5 className="card-title">{service.name}</h5>
                        <p className="card-text">{service.description}</p>
                        <a className="btn btn-primary">Ver más</a>
                    </div>
                </div>
            ))}
        </div>
    )
}