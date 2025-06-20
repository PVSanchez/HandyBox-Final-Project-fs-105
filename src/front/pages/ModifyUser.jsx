import React, { useState, useEffect } from "react";
import { userService } from '../services/users'
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";

const INITIAL_STATE = {
    email: '',
    password: '',
    user_name: '',
    first_name: '',
    last_name: '',
    img: ''
}

export const ModifyUser = () => {
    const navigate = useNavigate()
    const [state, setState] = useState(INITIAL_STATE)
    const [error, setError] = useState('')
    const [rolType, setRolType] = useState('client')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await userService.getCurrentUser()
                if (response && response.success && response.data) {
                    setState({
                        email: '',
                        password: '',
                        user_name: response.data.user_name || '',
                        first_name: response.data.first_name || '',
                        last_name: response.data.last_name || '',
                        img: response.data.img || ''
                    })
                    setRolType(response.data.role || 'client')
                }
            } catch (error) {
                console.error("Error al obtener datos del usuario:", error)
                setError('Error al cargar los datos del usuario')
            }
        }
        fetchUserData()
    }, [])

    const handleChange = (event) => {
        const inputName = event.target.name
        const inputValue = event.target.value
        setState({ ...state, [inputName]: inputValue })
        setError('')
    }

    const validateForm = () => {
        if (!state.password) return true

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
            const result = await userService.updateUser(state, rolType)
            setLoading(false)
            if (result.success) {
                navigate('/')
            } else {
                setError(result.error)
            }
        } catch (error) {
            setLoading(false)
            setError('Error al modificar usuario')
        }
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

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-center mb-4">
                                <img
                                    src={state.img || defaultImg}
                                    alt="preview"
                                    className="rounded-circle border border-2 img-fluid"
                                    width="120" height="120"
                                />
                            </div>
                            <h2 className="text-center mb-4">Modificar Perfil</h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            {loading ? <div className="text-center my-3"><Spinner /></div> : (
                                <form onSubmit={handleSubmit}>
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
                                        <label htmlFor="password" className="form-label">Nueva Contraseña (opcional)</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={state.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="repeatPassword" className="form-label">Repetir nueva contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="repeatPassword"
                                            name="repeatPassword"
                                            value={repeatPassword}
                                            onChange={event => setRepeatPassword(event.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="custom-btn w-100">
                                        Guardar cambios
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}