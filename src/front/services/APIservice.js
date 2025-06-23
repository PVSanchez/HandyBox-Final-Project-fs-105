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

export const createService = async (serviceData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, error: "No hay token de sesión" };

    const response = await fetch(`${URL}api/service/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token.trim()}`,
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

export const createStripePay = async (payData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return { success: false, error: "No hay token de sesión" };

    
    console.log("Enviando a /api/stripe-pay:", payData);

    const response = await fetch(`${URL}api/stripe-pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token.trim()}`,
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
