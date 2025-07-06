const URL = import.meta.env.VITE_BACKEND_URL;

export const getAllRates = async () => {
  try {
    const response = await fetch(`${URL}api/rate/`);

    if (!response.ok) {
      throw new Error("Error al obtener las valoraciones");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const getRatesByServiceId = async (service_id) => {
  try {
    const response = await fetch(`${URL}api/rate/service/${service_id}`);

    if (!response.ok){
      throw new Error("Error al obtener la valoración")
    }

    const data = response.json()
    return data;

  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const postRate = async (rateData) => {
  const token = sessionStorage.getItem("token");
  try {
    const response = await fetch(`${URL}api/rate/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(rateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al enviar la valoración");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al enviar la valoración:", error);
    throw error;
  }
};
