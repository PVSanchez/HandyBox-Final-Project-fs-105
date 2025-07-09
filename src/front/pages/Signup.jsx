import React, { useState } from "react";
import { userService } from '../services/users'
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import '../style/Signup.css'

const INITIAL_STATE = {
    email: '',
    password: '',
    user_name: '',
    first_name: '',
    last_name: '',
    img: ''
}

export const Signup = () => {
    const navigate = useNavigate()
    const [state, setState] = useState(INITIAL_STATE)
    const [error, setError] = useState('')
    const [rolType, setRolType] = useState('client')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (event) => {
        const inputName = event.target.name
        const inputValue = event.target.value
        setState({ ...state, [inputName]: inputValue })
        setError('')
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setState(prev => ({ ...prev, img: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const defaultImg = "https://cdn-icons-png.flaticon.com/512/149/149071.png"

    const validateForm = () => {
        const validations = {
            match: {
                test: (pass) => pass === repeatPassword,
                message: 'Las contraseñas no coinciden'
            },
            length: {
                test: (pass) => pass.length >= 8,
                message: 'La contraseña debe tener al menos 8 caracteres'
            },
            uppercase: {
                test: (pass) => /[A-Z]/.test(pass),
                message: 'La contraseña debe contener al menos una mayúscula'
            },
            lowercase: {
                test: (pass) => /[a-z]/.test(pass),
                message: 'La contraseña debe contener al menos una minúscula'
            },
            number: {
                test: (pass) => /\d/.test(pass),
                message: 'La contraseña debe contener al menos un número'
            }
        }
        for (const validation of Object.values(validations)) {
            if (!validation.test(state.password)) {
                setError(validation.message)
                return false
            }
        }
        return true
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!validateForm()) {
            return
        }
        setLoading(true)
        try {
            const result = await userService.SignupUser(state, rolType)
            if (result.success) {
                if (rolType === 'professional') {
                    const loginRes = await userService.LoginUser({
                        email: state.email,
                        password: state.password
                    })
                    setLoading(false)
                    if (loginRes.success) {
                        navigate('/create-user-detail')
                    } else {
                        setError('Usuario creado, pero error al iniciar sesión automáticamente. Inicia sesión manualmente.')
                        navigate('/login')
                    }
                } else {
                    setLoading(false)
                    navigate('/login')
                }
            } else {
                setLoading(false)
                setError(result.error)
            }
        } catch (error) {
            setLoading(false)
            console.error("Error en el registro:", error)
            setError('Error al registrar usuario')
        }
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Registro</h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <div className="d-flex justify-content-center mb-4">
                                <img
                                    src={state.img || defaultImg}
                                    alt="preview"
                                    className="rounded-circle border border-2 img-fluid"
                                    width="120" height="120"
                                />
                            </div>
                            {loading ? (
                                <div className="text-center my-3"><Spinner /></div>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="img" className="form-label">Imagen de perfil</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="img"
                                            name="img"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="email"
                                                value={state.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="user_name" className="form-label">Nombre de usuario</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="user_name"
                                                name="user_name"
                                                value={state.user_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="first_name" className="form-label">Nombre</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="first_name"
                                                name="first_name"
                                                value={state.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="last_name" className="form-label">Apellido</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="last_name"
                                                name="last_name"
                                                value={state.last_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">Contraseña</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                name="password"
                                                value={state.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="repeatPassword" className="form-label">Repetir contraseña</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="repeatPassword"
                                                name="repeatPassword"
                                                value={repeatPassword}
                                                onChange={event => setRepeatPassword(event.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Tipo de usuario</label>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="rolType"
                                                    id="client"
                                                    value="client"
                                                    checked={rolType === 'client'}
                                                    onChange={(event) => setRolType(event.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="client">
                                                    Cliente
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="rolType"
                                                    id="professional"
                                                    value="professional"
                                                    checked={rolType === 'professional'}
                                                    onChange={(event) => setRolType(event.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="professional">
                                                    Profesional
                                                </label>
                                            </div>
                                        </div>
                                        <button type="submit" className="custom-btn w-100">
                                            Registrarse
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}