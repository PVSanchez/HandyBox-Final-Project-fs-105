import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getServiceById, updateService } from "../services/APIservice";
import { Spinner } from "../components/Spinner";

export const ModifyService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    useEffect(() => {
        if (form && form.status === false) {
            setError("Este servicio está inactivo y no puede ser modificado.");
        }
    }, [form]);

    useEffect(() => {
        const fetchService = async () => {
            const response = await getServiceById(id);
            if (response) {
                setForm(response);
            } else {
                setError("Error al cargar el servicio");
            }
            setLoading(false);
        };
        fetchService();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size > MAX_FILE_SIZE) {
            setError("La imagen no puede superar los 10MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({ ...prev, img: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleVideoChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size > MAX_FILE_SIZE) {
            setError("El video no puede superar los 10MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({ ...prev, video: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Solo enviamos los campos que el usuario puede modificar aquí
        const updatedData = {
            name: form.name,
            description: form.description,
            price: form.price,
            url: form.url,
            img: form.img,
            video: form.video,
        };

        const result = await updateService(id, updatedData);

        if (result.success) {
            navigate("/services");
        } else {
            setError(result.error || "No se pudo actualizar el servicio");
        }

        setLoading(false);
    };

    if (loading) return <Spinner />;
    if (!form) return <div className="alert alert-danger">Servicio no encontrado</div>;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center mb-5">
                <div className="col-md-8">
                    <div className="card p-3">
                        <h2 className="text-center mb-4">Modificar Servicio</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Nombre del Servicio</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="form-control"
                                    maxLength={255}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Precio</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Imagen</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Video</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="form-control"
                                />
                            </div>

                            <button type="submit" className="custom-btn-1 w-100">
                                Guardar Cambios
                            </button>
                            <Link to="/select-service-to-modify" className="custom-btn-1 w-100 mt-2">
                                Cancelar
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
