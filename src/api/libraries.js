import { api } from '../lib/api'

export function listLibraries() {
  return api.get('/libraries').then((r) => r.data.data)
}

export function getLibrary(id) {
  return api.get(`/libraries/${id}`).then((r) => r.data.data)
}

export function createLibrary(payload) {
  return api.post('/libraries', payload).then((r) => r.data)
}

export function updateLibrary(id, payload) {
  return api.put(`/libraries/${id}`, payload).then((r) => r.data)
}

export function deleteLibrary(id) {
  return api.delete(`/libraries/${id}`).then((r) => r.data)
}
