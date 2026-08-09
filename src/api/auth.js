import { api } from '../lib/api'

export function login(email, password) {
  return api.post('/auth/login', { email, password }).then((r) => r.data)
}

export function logout() {
  return api.post('/auth/logout').then((r) => r.data)
}

export function me() {
  return api.get('/auth/me').then((r) => r.data)
}
