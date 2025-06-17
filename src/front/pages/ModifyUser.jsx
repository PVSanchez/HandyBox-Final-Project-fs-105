import React, { useState, useEffect } from "react";
import { userService } from '../services/users'
import { useNavigate } from "react-router-dom";

const INITIAL_STATE = {
    email: '',
    password: '',
    user_name: '',
    first_name: '',
    last_name: ''
}

export const ModifyUser = () => {
    const navigate = useNavigate()
    const [state, setState] = useState(INITIAL_STATE)
    const [error, setError] = useState('')
    const [rolType, setRolType] = useState('client')
    const [repeatPassword, setRepeatPassword] = useState('')

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await userService.getCurrentUser()
                if (userData) {
                    setState({
                        email: userData.email || '',
                        password: '',
                        user_name: userData.user_name || '',
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || ''
                    })
                    setRolType(userData.role || 'client')
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

        try {
            const updateData = { ...state }
            if (!updateData.password) {
                delete updateData.password
            }

            const result = await userService.updateUser(updateData)
            if (result.success) {
                navigate('/')
            } else {
                setError(result.error)
            }
        } catch (error) {
            console.error("Error en la actualización:", error)
            setError('Error al actualizar usuario')
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Modificar Perfil</h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
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
                                <button type="submit" className="btn btn-primary w-100">
                                    Actualizar Perfil
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}