const SignupUser = async(body, rolType) => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const url = `${backendUrl}api/user/register/${rolType}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        
        const data = await response.json()
        
        if(response.ok){
            return { success: true, data }
        }
        
        return { 
            success: false, 
            error: data.error || 'Error al registrar usuario' 
        }

    } catch (error) {
        console.error("Error al registrar usuario:", error)
        return { 
            success: false, 
            error: 'Error de conexión al registrar usuario' 
        }
    }
}

const LoginUser = async(body) => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const url = `${backendUrl}api/user/login`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()

        if(response.ok){
            if (data.token) {
                sessionStorage.setItem('token', data.token)
                sessionStorage.setItem('user', JSON.stringify(data.user))
            }
            return { success: true, data }
        }
        
        return { 
            success: false, 
            error: data.error || 'Error al iniciar sesión' 
        }

    } catch (error) {
        console.error("Error al iniciar sesión:", error)
        return { 
            success: false, 
            error: 'Error de conexión al iniciar sesión' 
        }
    }
}

const LogoutUser = async() => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const url = `${backendUrl}api/user/logout`
        const token = sessionStorage.getItem('token')

        if (!token) {
            return { 
                success: false, 
                error: 'No hay sesión activa' 
            }
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token.trim()}`
            },
            credentials: 'include'
        })

        const data = await response.json()

        if(response.ok){
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('user')
            return { success: true, data }
        }
        
        return { 
            success: false, 
            error: data.error || 'Error al cerrar sesión' 
        }

    } catch (error) {
        console.error("Error al cerrar sesión:", error)
        return { 
            success: false, 
            error: 'Error de conexión al cerrar sesión' 
        }
    }
}

export const userService = {
    SignupUser,
    LoginUser,
    LogoutUser
}