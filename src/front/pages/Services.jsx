import React, { useState, useEffect } from "react";
import { CardService } from '../components/CardService';
import { getAllServices } from "../services/APIservice";

export const Services = () => {

  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const data = await getAllServices();
      console.log(data)
      setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <div className="container text-center mt-5">
      <h1 className="display-3 fw-bold">Página de servicios</h1>
      <CardService services={services}/>
    </div>
  );
};