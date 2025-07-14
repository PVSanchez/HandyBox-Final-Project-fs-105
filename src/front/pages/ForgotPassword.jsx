import React, { useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "../services/users";
export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);

        const response = await userService.forgotPassword(email);

        setLoading(false);
        if (response.success) {
            setMessage("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
        } else {
            setError(response.error);
        }
    };

    return (
        <div className="container m-auto">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <form onSubmit={handleSubmit}>
                        <h1 className="text-center display-4 fw-bold mb-4">Reset Password</h1>

                        {message && <div className="alert alert-success">{message}</div>}
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Ingresa tu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="custom-btn w-100" disabled={loading}>
                            {loading ? "Enviando..." : "Enviar"}
                        </button>

                        <div className="mt-3">
                            <Link to="/login">Volver al Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
