import axios from "axios";

export const api = axios.create({
  baseURL: "/api"
});

api.interceptors.request.use((config) => {
  const rawSession = localStorage.getItem("carpuni.auth");
  if (!rawSession) {
    return config;
  }

  try {
    const session = JSON.parse(rawSession) as { token?: string };
    if (session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    localStorage.removeItem("carpuni.auth");
  }

  return config;
});
