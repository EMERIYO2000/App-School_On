import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/",
  headers: { "Content-Type": "application/json" },
});

export const getAccessToken = () => localStorage.getItem("so_access");
export const getRefreshToken = () => localStorage.getItem("so_refresh");

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("so_access", access);
  if (refresh) localStorage.setItem("so_refresh", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("so_access");
  localStorage.removeItem("so_refresh");
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const refresh = getRefreshToken();
    const authPath = String(original.url || "");
    const isAuthRoute = /auth\/(login|register|token\/refresh|password-reset-request|password-reset-confirm)/.test(authPath);

    if (status === 401 && refresh && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${api.defaults.baseURL}auth/token/refresh/`, { refresh })
            .then((res) => {
              setTokens(res.data);
              return res.data;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const data = await refreshPromise;
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        clearTokens();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    if (status === 401 && isAuthRoute) {
      clearTokens();
    }

    return Promise.reject(error);
  },
);

export const getError = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "Une erreur est survenue.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.non_field_errors?.length) return data.non_field_errors.join(" ");
  const fieldErrors = Object.entries(data)
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;
      const msg = Array.isArray(value) ? value.join(" ") : String(value);
      return `${label} : ${msg}`;
    })
    .join(" ");
  return fieldErrors || "Données invalides.";
};

const FIELD_LABELS = {
  email: "E-mail",
  password: "Mot de passe",
  confirm_password: "Confirmation du mot de passe",
  older_password: "Ancien mot de passe",
  new_password: "Nouveau mot de passe",
  full_name: "Nom complet",
  phone_number: "Téléphone",
  login_id: "Identifiant",
  code: "Code",
  amount: "Montant",
  course: "Cours",
  non_field_errors: "",
};

export const isNotFound = (error) => error?.response?.status === 404;
export const isForbidden = (error) => error?.response?.status === 403;
export const isUnauthorized = (error) => error?.response?.status === 401;

export default api;
