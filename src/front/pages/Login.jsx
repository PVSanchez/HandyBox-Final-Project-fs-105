import React, { useState } from "react";
import { userService } from '../services/users';
import { useNavigate, Link } from "react-router-dom";
import { Spinner } from "../components/Spinner";

export const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false);
    const [logoutMsg, setLogoutMsg] = useState("");
    const navigate = useNavigate()

    
    React.useEffect(() => {
        const user = sessionStorage.getItem("user");
        if (user) {
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            window.dispatchEvent(new Event('userChanged'));
            setLogoutMsg("Sesión cerrada correctamente.");
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")
        setLoading(true)
        const result = await userService.LoginUser({ email, password })
        setLoading(false)
        if (result.success) {
            navigate("/") // redirección por defecto a la página principal, hay que cambiarlo a la página que corresponda cuando estén creadas
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="container m-auto">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h1 className="text-center display-3 fw-bold">Login</h1>
                    {logoutMsg && <div className="alert alert-info">{logoutMsg}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {loading ? <div className="text-center my-3"><Spinner /></div> : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={event => setEmail(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={event => setPassword(event.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="custom-btn w-100">Login</button>
                            <div className="mt-3">
                                <Link to="/forgot-password">¿Has olvidado la contraseña?</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}