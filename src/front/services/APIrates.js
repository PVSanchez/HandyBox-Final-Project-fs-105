const URL = import.meta.env.VITE_BACKEND_URL;

export const getRatesByServiceId = async (service_id) => {
  try {
    const response = await fetch(`${URL}api/rate/service/${service_id}`);
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};
