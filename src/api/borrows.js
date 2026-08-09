import { api } from '../lib/api'

export function listBorrows() {
  return api.get('/borrows').then((r) => r.data.data)
}

export function listActiveBorrows() {
  return api.get('/borrows/active').then((r) => r.data.data)
}

export function listReturnedBorrows() {
  return api.get('/borrows/returned').then((r) => r.data.data)
}

export function listOverdueBorrows() {
  return api.get('/borrows/overdue').then((r) => r.data.data)
}

export function createBorrow(payload) {
  return api.post('/borrows', payload).then((r) => r.data)
}

export function returnBorrow(id) {
  return api.post(`/borrows/${id}/return`).then((r) => r.data)
}
