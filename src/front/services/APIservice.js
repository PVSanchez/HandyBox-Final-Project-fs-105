const URL = import.meta.env.VITE_BACKEND_URL

export const getAllServices = async () => {
    try {
        const response = await fetch(`${URL}/api/service/`);
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