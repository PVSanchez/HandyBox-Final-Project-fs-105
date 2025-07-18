const URL = import.meta.env.VITE_BACKEND_URL;

export const getAllServices = async () => {
  try {
    const response = await fetch(`${URL}api/service/`);
    if (!response.ok) {
      throw new Error("Error al obtener los servicios");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const getServiceById = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${URL}api/service/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Error desconocido" };
    }

    return data;
  } catch (error) {
    console.error("Error al realizar la petición:", error);
    return { error: "Error al conectar con el servidor" };
  }
};

export const getAllMyServices = async () => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${URL}api/service/my-services`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener tus servicios");
    return await response.json();
  } catch (error) {
    console.error("Error en getAllMyServices:", error);
    return [];
  }
};

export const getUserServices = async (userId) => {
  try {
    const response = await fetch(`${URL}api/service/users/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error en la petición.");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateService = async (id, data) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${URL}api/service/services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Error al actualizar servicio",
      };
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Error de red o servidor" };
  }
};

export const createService = async (serviceData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, error: "No hay token de sesión" };

    const response = await fetch(`${URL}api/service/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify(serviceData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    }

    return { success: false, error: data.error || "Error al crear servicio" };
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return { success: false, error: "Error de conexión al crear servicio" };
  }
};

export const toggleServiceStatus = async (id, status) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${URL}api/service/services/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "No se pudo cambiar el estado",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error de red o servidor" };
  }
};

export const createStripePay = async (payData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, error: "No hay token de sesión" };

    console.log("Enviando a /api/stripe-pay:", payData);

    const response = await fetch(`${URL}api/stripe-pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify(payData),
    });

    if (!response.ok) {
      let errorMsg = "Error al registrar pago";
      try {
        const data = await response.json();
        errorMsg = data.error || errorMsg;
      } catch (e) {}
      return { success: false, error: errorMsg };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return { success: false, error: "Error de conexión al registrar pago" };
  }
};
