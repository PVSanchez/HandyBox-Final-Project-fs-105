import React, { useState } from "react";

export const RateModal = ({ onSubmit, serviceId, clientId, stripeId }) => {

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const handleStarClick = (value) => {
        setRating(value);
        setError("")
    };

    const handleSubmit = () => {
        if (rating < 1 || rating > 5) {
            setError("Selecciona una valoración entre 1 y 5 estrellas.");
            return;
        }

        setError("");

        onSubmit({
            client_rate: rating,
            comment,
            service_id: serviceId,
            client_id: clientId,
            stripe_id: stripeId,
        });

        // Limpiar estado y cerrar
        setRating(0);
        setComment("");
        onClose();
    };


    return (
        <div className="modal fade" id="rateModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Valorar servicio</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p className="modal-title">Puntua el servicio:</p>
                        <div className="text-center mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    style={{
                                        fontSize: "2rem",
                                        cursor: "pointer",
                                        color: star <= rating ? "#ffc107" : "#e4e5e9"
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
                            <textarea className="form-control" id="comment" rows="3"></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            Enviar valoración
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}