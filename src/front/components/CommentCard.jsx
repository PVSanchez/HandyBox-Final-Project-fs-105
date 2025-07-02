import React from "react";

export const CommentCard = ({ rates }) => {
    console.log(rates)
    console.log(rates.comment)
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
                            <h5 className="card-title">{rate.client?.first_name} {rate.client?.last_name}</h5>
                            <span>⭐⭐⭐⭐⭐ {rate.client_rate}</span>
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