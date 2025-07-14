import React, { useState, useEffect } from "react";
import { CardService } from '../components/CardService';
import { getAllServices } from "../services/APIservice";
import { getAllRates } from "../services/APIrates";

export const Services = () => {

  const [services, setServices] = useState([]);
  const [rates, setRates] = useState([])

  useEffect(() => {
    const fetchServices = async () => {
      const data = await getAllServices();
      setServices(data);
    };

    const fetchRates = async () => {
      const data = await getAllRates();
      setRates(data);
    };
    
    fetchServices();
    fetchRates();
  }, []);

  return (
    <div className="container text-center mt-5 mb-5">
      <h1 className="display-3 fw-bold mb-4">Servicios disponibles</h1>
      {services.length > 0 ? (
        <CardService
          services={services}
          rates={rates} />
      ) : (
        <p className="mt-4 fs-4 lead">No existe ningún servicio.</p>
      )}
    </div>
  );
};