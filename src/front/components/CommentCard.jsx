import React from "react";

export const CommentCard = ({ rates }) => {
    return (
        <div>
            {rates.map((rate) => (
                <div key={rate.id} className="card p-3 my-3" style={{ width: "100%" }}>
                    <div className="d-flex">
                        <img
                            src={rate.client?.img || "https://placeholder.pics/svg/300x200"}
                            className="card-img-top"
                            alt={`Foto de ${rate.client?.user_name || "cliente"}`}
                            style={{ height: "75px", width: "75px", borderRadius: "50%", objectFit: 'cover' }}
                        />
                        <div className="d-flex flex-column px-2">
                            <div className="d-flex">
                                <h5 className="card-title m-0">{rate.client?.first_name} {rate.client?.last_name}</h5>
                                <span className="mx-2 fst-italic font-monospace text-muted">{rate.created_at}</span>
                            </div>
                            <div className="d-flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        style={{
                                            fontSize: "1.3rem",
                                            color: star <= rate.client_rate ? "#ffc107" : "#e4e5e9"
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="card-body px-0 py-4">
                        <p className="card-text text-muted">{rate.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}