import { AuthResponse, StudentProfileDto, UserDto } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && !window.location.hostname.includes("localhost")
    ? "https://ai-study-twin.onrender.com/api"
    : "http://localhost:5050/api");

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ai_study_twin_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ai_study_twin_refresh");
};

export const setAuthTokens = (access: string, refresh: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ai_study_twin_token", access);
  localStorage.setItem("ai_study_twin_refresh", refresh);
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ai_study_twin_token");
  localStorage.removeItem("ai_study_twin_refresh");
  localStorage.removeItem("ai_study_twin_user");
  localStorage.removeItem("ai_study_twin_profile");
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Try refresh token if available
      const refreshToken = getRefreshToken();
      if (refreshToken && token && !endpoint.includes("/auth/refresh-token")) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: token, refreshToken }),
          });

          if (refreshRes.ok) {
            const data: AuthResponse = await refreshRes.json();
            setAuthTokens(data.accessToken, data.refreshToken);

            // Retry original request
            headers["Authorization"] = `Bearer ${data.accessToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            if (retryRes.ok) {
              return await retryRes.json();
            }
          }
        } catch {
          clearAuthTokens();
        }
      }

      clearAuthTokens();
      throw new ApiError("Avtorizatsiyadan o'tilmagan", 401);
    }

      if (!res.ok) {
        let errorMessage = "Serverda xatolik yuz berdi";
        let errorData: any;
        try {
          errorData = await res.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.errors && typeof errorData.errors === "object") {
            const firstKey = Object.keys(errorData.errors)[0];
            if (firstKey && Array.isArray(errorData.errors[firstKey])) {
              errorMessage = `${firstKey}: ${errorData.errors[firstKey][0]}`;
            } else {
              errorMessage = errorData.title || errorMessage;
            }
          } else if (errorData?.title) {
            errorMessage = errorData.title;
          }
        } catch {}

        throw new ApiError(errorMessage, res.status, errorData?.errors);
      }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : "Internet aloqasi bilan bog'liq muammo",
      0
    );
  }
}
