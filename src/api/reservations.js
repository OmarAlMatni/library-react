import { api } from '../lib/api'

export function listReservations() {
  return api.get('/reservations').then((r) => r.data.data)
}

export function listPendingReservations() {
  return api.get('/reservations/pending').then((r) => r.data.data)
}

export function listStudentReservations(studentId) {
  return api.get(`/reservations/student/${studentId}`).then((r) => r.data.data)
}

export function createReservation(payload) {
  return api.post('/reservations', payload).then((r) => r.data)
}

export function fulfillReservation(id) {
  return api.post(`/reservations/${id}/fulfill`).then((r) => r.data)
}

export function cancelReservation(id) {
  return api.post(`/reservations/${id}/cancel`).then((r) => r.data)
}
