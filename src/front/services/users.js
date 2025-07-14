const SignupUser = async (body, rolType) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/register/${rolType}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    }

    return {
      success: false,
      error: data.error || "Error al registrar usuario",
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      success: false,
      error: "Error de conexión al registrar usuario",
    };
  }
};

const LoginUser = async (body) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/login`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("userChanged"));
      }
      return { success: true, data };
    }

    return {
      success: false,
      error: data.error || "Error al iniciar sesión",
    };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return {
      success: false,
      error: "Error de conexión al iniciar sesión",
    };
  }
};

const LogoutUser = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/logout`;
    const token = sessionStorage.getItem("token");

    if (!token) {
      return {
        success: false,
        error: "No hay sesión activa",
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.dispatchEvent(new Event("userChanged"));
      return { success: true, data };
    }

    return {
      success: false,
      error: data.error || "Error al cerrar sesión",
    };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return {
      success: false,
      error: "Error de conexión al cerrar sesión",
    };
  }
};

const getCurrentUser = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/me`;
    const token = sessionStorage.getItem("token");
    if (!token) {
      return { success: false, error: "No hay token de sesión" };
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.error || "Error al obtener usuario" };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return { success: false, error: "Error de conexión al obtener usuario" };
  }
};

const updateUser = async (userData) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/me`;
    const token = sessionStorage.getItem("token");
    if (!token) {
      return { success: false, error: "No hay token de sesión" };
    }
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return {
      success: false,
      error: data.error || "Error al actualizar usuario",
    };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: "Error de conexión al actualizar usuario" };
  }
};

const forgotPassword = async (email) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/forgot-password`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    }

    return {
      success: false,
      error: data.error || "Error al enviar el correo de recuperación",
    };
  } catch (error) {
    console.error("Error al enviar recuperación:", error);
    return {
      success: false,
      error: "Error de conexión al solicitar recuperación",
    };
  }
};

const resetPassword = async (newPassword, token) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const url = `${backendUrl}api/user/reset-password`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    }

    return {
      success: false,
      error: data.error || "Error al restablecer la contraseña",
    };
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return {
      success: false,
      error: "Error de conexión al restablecer la contraseña",
    };
  }
};



export const userService = {
  SignupUser,
  LoginUser,
  LogoutUser,
  getCurrentUser,
  updateUser,
  forgotPassword,
  resetPassword,
};
