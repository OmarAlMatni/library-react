import axios from 'axios'

// Base URL for the Laravel backend. Configure VITE_API_URL in .env to
// point at wherever `php artisan serve` (or your deployed API) is running.
// Falls back to the default local Laravel dev server address.
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

const TOKEN_KEY = 'library_auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Listeners fired when the API tells us the session is no longer valid.
// AuthContext subscribes to this so a 401 anywhere logs the user out
// and sends them back to the login screen automatically.
const unauthorizedListeners = new Set()

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedListeners.forEach((listener) => listener())
    }
    return Promise.reject(error)
  }
)

// Pulls the human-readable message out of a Laravel error response.
// Handles both the simple {message} shape and validation-error
// {message, errors: {field: [msg]}} shapes.
export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (data.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first.length) return first[0]
  }
  return data.message || fallback
}
