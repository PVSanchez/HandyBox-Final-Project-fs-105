import React, { useState } from "react";
import { userService } from "../services/users";
import { useSearchParams, useNavigate } from "react-router-dom";

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token"); // token de la URL
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (!token) {
            setError("Token no válido o expirado.");
            return;
        }

        if (password !== repeatPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        const response = await userService.resetPassword(password, token);
        setLoading(false);

        if (response.success) {
            setMessage("Contraseña actualizada exitosamente.");
            setTimeout(() => navigate("/login"), 3000); // Redirige después de 3 segundos
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
                            <label htmlFor="password" className="form-label">Nueva contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Nueva contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="repeat-password" className="form-label">Repetir contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="repeat-password"
                                placeholder="Repetir contraseña"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="custom-btn w-100" disabled={loading}>
                            {loading ? "Enviando..." : "Actualizar Contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};