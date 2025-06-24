import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceById } from "../services/APIservice";

export const ServiceDetail = () => {

    const defaultImg = "https://cdn-icons-png.flaticon.com/512/149/149071.png"

    const { id } = useParams();
    const [service, setService] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchService = async () => {
            const data = await getServiceById(id);
            setService(data);
            setLoading(false);
            console.log(data)
        };
        fetchService();
    }, [id]);

    return (
        <div className="container">
            {loading ? (
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>) : (
                <div className="row">
                    <div className="col-8">
                        <h3>{service.name}</h3>
                        <p>{service.description} </p>
                    </div>
                    <div className="col-4">
                        <h5 className="card-title m-2">Servicio ofrecido por:</h5>
                        <div className="d-flex justify-content-center">
                            <div className="card text-center align-items-center" style={{ width: "18rem" }}>
                                <img
                                    src={service.user.img || defaultImg}
                                    className="card-img-top"
                                    alt={`Foto de ${service.user.user_name}`}
                                    style={{ width: "150px", borderRadius: "50%" }}
                                />

                                <div className="card-body">
                                    <p className="card-text">First name: {service.user.first_name}</p>
                                    <p className="card-text">Last name: {service.user.last_name}</p>
                                    <p className="card-text">Email: {service.user.email}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    <Link to="/services" className="custom-btn ms-2">
                        Volver a servicios
                    </Link>
                </div>
            )}
        </div >
    )
}