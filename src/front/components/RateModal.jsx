import React, { useState } from "react";
import { postRate } from "../services/APIrates";

export const RateModal = ({ serviceId, clientId, stripeId, created_at, onSuccess, onClose }) => {

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleStarClick = (value) => {
        setRating(value);
        setError("")
    };

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            setError("Selecciona una valoración entre 1 y 5 estrellas.");
            return;
        }

        if (!clientId || !serviceId || !stripeId) {
            setError("Parece que hubo un error.");
            return;
        }

        const rateData = {
            client_id: clientId,
            service_id: serviceId,
            stripe_id: stripeId,
            client_rate: rating,
            created_at: created_at,
            comment: comment
        };

        setLoading(true)

        try {
            await postRate(rateData);
            if (onSuccess) onSuccess(); // refrescar valoraciones
            setRating(0);
            setComment("");
            setError("");

            // Cierra el modal con Bootstrap JS
            const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#rateModal'));
            modal.hide();

        } catch (err) {
            setError(err.message || "Error al enviar la valoración.");
        } finally {
            setLoading(false);
        }

    };


    return (
        <div className="modal fade" id="rateModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Valorar servicio</h1>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12 col-md-8 mx-auto">
                                    <p className="modal-title">Puntua el servicio:</p>
                                    <div className="d-flex justify-content-center mb-3 flex-wrap">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                style={{
                                                    fontSize: "2.2rem",
                                                    cursor: "pointer",
                                                    color: star <= rating ? "#ffc107" : "#e4e5e9",
                                                    margin: "0 0.2rem"
                                                }}
                                                onClick={() => handleStarClick(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    {error && (
                                        <div className="alert alert-danger py-2" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label htmlFor="comment" className="form-label">Comentario:</label>
                                        <textarea
                                            className="form-control"
                                            id="comment"
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}>
                                        </textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Enviando..." : "Enviar valoración"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}