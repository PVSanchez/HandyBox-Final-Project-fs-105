const URL = import.meta.env.VITE_BACKEND_URL;

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
