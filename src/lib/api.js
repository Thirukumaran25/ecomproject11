import axios from 'axios'

const API_BASE = 'https://ecomproject1-iobp.onrender.com/api/'

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export function getTokens() {
  return {
    access: localStorage.getItem(ACCESS_KEY) || '',
    refresh: localStorage.getItem(REFRESH_KEY) || '',
  }
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const { access } = getTokens()
  if (access) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let isRefreshing = false
let queue = []

function processQueue(error, token) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const { refresh } = getTokens()
      if (!refresh) {
        clearTokens()
        return Promise.reject(error)
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        })
          .then((newAccess) => {
            original.headers.Authorization = `Bearer ${newAccess}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }
      isRefreshing = true
      try {
        const resp = await axios.post(`${API_BASE}auth/jwt/refresh/`, { refresh })
        const newAccess = resp.data.access
        setTokens({ access: newAccess })
        processQueue(null, newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshErr) {
        clearTokens()
        processQueue(refreshErr, null)
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export async function login(username, password) {
  const resp = await api.post(`auth/jwt/token/`, { username, password })
  const { access, refresh } = resp.data
  setTokens({ access, refresh })
  return resp.data
}

export function logout() {
  clearTokens()
}

export async function register({ username, email, password }) {
  const resp = await api.post(`auth/register/`, { username, email, password })
  return resp.data
}

export default api
