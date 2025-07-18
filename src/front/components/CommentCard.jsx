import React from "react";
import '../style/CommentCard.css';

export const CommentCard = ({ rates }) => {
    return (
        <div className="comment-list">
            {rates.length === 0 ? (
                <div className="card p-3 my-3 w-100">
                    <div className="row g-0 align-items-center">
                        <div className="col-3 col-sm-2 d-flex align-items-center justify-content-start">
                            <img
                                src="https://placeholder.pics/svg/300x200"
                                className="rounded-circle img-fluid comment-user-img"
                                alt="Sin valoraciones"
                            />
                        </div>
                        <div className="col-9 col-sm-10">
                            <div className="d-flex flex-row align-items-center px-2">
                                <h5 className="card-title m-0 me-2 text-start">Sin valoraciones</h5>
                            </div>
                            <div className="d-flex align-items-center px-2 mt-1">
                                <div className="d-flex flex-row align-items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className="comment-star"
                                        >
                                            ☆
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-3">
                        <p className="card-text text-muted mb-0">No hay valoraciones aún.</p>
                    </div>
                </div>
            ) : (
                rates.map((rate) => (
                    <div key={rate.id} className="card p-3 my-3 w-100">
                        <div className="row g-0 align-items-center">
                            <div className="col-3 col-sm-2 d-flex align-items-center justify-content-start">
                                <img
                                    src={rate.client?.img || "https://placeholder.pics/svg/300x200"}
                                    className="rounded-circle img-fluid comment-user-img"
                                    alt={`Foto de ${rate.client?.user_name || "cliente"}`}
                                />
                            </div>
                            <div className="col-9 col-sm-10">
                                <div className="d-flex flex-row align-items-center px-2">
                                    <h5 className="card-title m-0 me-2 text-start">{rate.client?.first_name} {rate.client?.last_name}</h5>
                                    <span className="fst-italic font-monospace text-muted small ms-2">{rate.created_at}</span>
                                </div>
                                <div className="d-flex align-items-center px-2 mt-1">
                                    <div className="d-flex flex-row align-items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`comment-star${star <= rate.client_rate ? ' filled' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-3">
                            <p className="card-text text-muted mb-0">{rate.comment}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}