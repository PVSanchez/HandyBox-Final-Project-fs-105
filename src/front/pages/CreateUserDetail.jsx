import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";

const URL = import.meta.env.VITE_BACKEND_URL;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const initialState = {
    acerca_de_mi: "",
    experiencia_laboral: "",
    portfolio: "",
    video: ""
};

export const CreateUserDetail = () => {
    const [form, setForm] = useState(initialState);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isProfessional, setIsProfessional] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();

    React.useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem("user"))
        if (!user || !user.rol || user.rol.type !== "professional") {
            setIsProfessional(false)
            return
        }
        const fetchDetail = async () => {
            try {
                const token = sessionStorage.getItem("token")
                const res = await fetch(`${URL}/api/user-detail/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        acerca_de_mi: data.acerca_de_mi || "",
                        experiencia_laboral: data.experiencia_laboral || "",
                        portfolio: data.portfolio || "",
                        video: data.video || ""
                    })
                    setIsEdit(true)
                }
            } catch (err) {
                console.error("Error al obtener detalle de usuario:", err)
            }
        }
        fetchDetail()
    }, [])

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleVideoChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size > MAX_FILE_SIZE) {
            setError("El video no puede superar los 10MB");
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, video: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => setTab(tab + 1);
    const handlePrev = () => setTab(tab - 1);

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        try {
            const token = sessionStorage.getItem("token");
            const user = JSON.parse(sessionStorage.getItem("user"))
            const method = isEdit ? "PUT" : "POST"
            const endpoint = isEdit ? `${URL}/api/user-detail/${user.id}` : `${URL}/api/user-detail/`
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    ...form
                })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage(isEdit ? "¡Detalle actualizado correctamente!" : "¡Detalle creado correctamente!")
                setForm(initialState)
                setTimeout(() => {
                    navigate(`/user-detail?id=${user.id}`)
                }, 1200)
            } else {
                setMessage(data.error || (isEdit ? "Error al actualizar detalle" : "Error al crear detalle"))
            }
        } catch (err) {
            setMessage("Error de red o servidor")
        } finally {
            setLoading(false)
        }
    }

    if (!isProfessional) return <div className="container mt-4"><div className="alert alert-danger">Acceso solo para profesionales.</div></div>

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center display-3 fw-bold">{isEdit ? "Actualizar" : "Crear"} Detalle de Usuario</h1>
            <form onSubmit={handleSubmit} className="row g-3 justify-content-center">
                <ul className="nav nav-tabs mb-4 justify-content-center" style={{ fontSize: "1.2rem" }}>
                    <li className="nav-item">
                        <button type="button" className={`nav-link${tab === 0 ? ' active' : ''}`} onClick={() => setTab(0)} style={{ minWidth: 180 }}>Acerca de mí</button>
                    </li>
                    <li className="nav-item">
                        <button type="button" className={`nav-link${tab === 1 ? ' active' : ''}`} onClick={() => setTab(1)} style={{ minWidth: 180 }}>Experiencia laboral</button>
                    </li>
                    <li className="nav-item">
                        <button type="button" className={`nav-link${tab === 2 ? ' active' : ''}`} onClick={() => setTab(2)} style={{ minWidth: 180 }}>Video Presentación</button>
                    </li>
                    <li className="nav-item">
                        <button type="button" className={`nav-link${tab === 3 ? ' active' : ''}`} onClick={() => setTab(3)} style={{ minWidth: 180 }}>Portfolio</button>
                    </li>
                </ul>
                <div className="col-12 col-md-10 col-lg-8 mx-auto p-4 rounded shadow-lg bg-white"
                    style={{ minHeight: 420, height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        {tab === 0 && (
                            <>
                                <div>
                                    <label className="form-label fs-5">Acerca de mí</label>
                                    <textarea name="acerca_de_mi" className="form-control form-control-lg mb-4" value={form.acerca_de_mi} onChange={handleChange} rows={8} required style={{ fontSize: "1.1rem", minHeight: 220 }} />
                                </div>
                                <div className="mt-3 d-flex justify-content-end align-items-end" style={{ minHeight: 56 }}>
                                    <button type="button" className="custom-btn px-4 py-2" onClick={handleNext} style={{ fontSize: "1.1rem" }}>Siguiente</button>
                                </div>
                            </>
                        )}
                        {tab === 1 && (
                            <>
                                <div>
                                    <label className="form-label fs-5">Experiencia laboral</label>
                                    <textarea name="experiencia_laboral" className="form-control form-control-lg mb-4" value={form.experiencia_laboral} onChange={handleChange} rows={8} style={{ fontSize: "1.1rem", minHeight: 220 }} />
                                </div>
                                <div className="mt-3 d-flex justify-content-between align-items-end" style={{ minHeight: 56 }}>
                                    <button type="button" className="custom-btn-1 px-4 py-2" onClick={handlePrev} style={{ fontSize: "1.1rem" }}>Anterior</button>
                                    <button type="button" className="custom-btn px-4 py-2" onClick={handleNext} style={{ fontSize: "1.1rem" }}>Siguiente</button>
                                </div>
                            </>
                        )}
                        {tab === 2 && (
                            <>
                                <div>
                                    <label className="form-label fs-5 mb-5">Video Presentación</label>
                                    <input type="file" name="video" accept="video/*" className="form-control form-control-lg mb-4 justify-content-center" onChange={handleVideoChange} style={{ fontSize: "1.1rem" }} />
                                </div>
                                <div className="mt-3 d-flex justify-content-between align-items-end" style={{ minHeight: 56 }}>
                                    <button type="button" className="custom-btn-1 px-4 py-2" onClick={handlePrev} style={{ fontSize: "1.1rem" }}>Anterior</button>
                                    <button type="button" className="custom-btn px-4 py-2" onClick={handleNext} style={{ fontSize: "1.1rem" }}>Siguiente</button>
                                </div>
                            </>
                        )}
                        {tab === 3 && (
                            <>
                                <div>
                                    <label className="form-label fs-5">Portfolio (texto o links)</label>
                                    <textarea name="portfolio" className="form-control form-control-lg mb-4" value={form.portfolio} onChange={handleChange} rows={8} style={{ fontSize: "1.1rem", minHeight: 220 }} />
                                </div>
                                <div className="mt-3 d-flex justify-content-between align-items-end" style={{ minHeight: 56 }}>
                                    <button type="button" className="custom-btn-1 px-4 py-2" onClick={handlePrev} style={{ fontSize: "1.1rem" }}>Anterior</button>
                                    <button type="submit" className="custom-btn px-4 py-2" disabled={loading} style={{ minWidth: 160, fontSize: "1.1rem" }}>
                                        {loading ? (
                                            <span className="me-2 align-middle"><Spinner /></span>
                                        ) : null}
                                        {loading ? "Guardando..." : isEdit ? "Actualizar Detalle" : "Crear Detalle"}
                                    </button>
                                </div>
                            </>
                        )}
                        {message && <div className="col-12 mt-4"><div className="alert alert-info text-center fs-5">{message}</div></div>}
                    </div>
                </div>
            </form>
        </div>
    )
}
