import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createService } from "../services/APIservice";

const INITIAL_STATE = {
    name: '',
    description: '',
    price: '',
    img: null,
    video: null,
    url: null,
    rate: null,
    status: true
};

export const CreateService = () => {
    const [form, setForm] = useState(INITIAL_STATE);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await createService(form);
        if (result.success) {
            navigate('/services');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Crear Servicio</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Nombre del Servicio</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea name="description" value={form.description} onChange={handleChange} className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Precio</label>
                                    <input type="number" name="price" value={form.price} onChange={handleChange} className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Video URL</label>
                                    <input type="text" name="video" value={form.video} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">URL</label>
                                    <input type="text" name="url" value={form.url} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="status"
                                        checked={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.checked })}
                                    />
                                    <label className="form-check-label">Servicio activo</label>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Crear Servicio</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
