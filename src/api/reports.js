import { api } from '../lib/api'

export function getBooksReport() {
  return api.get('/reports/books').then((r) => r.data.data)
}

export function getMostBorrowedBooks() {
  return api.get('/reports/most-borrowed-books').then((r) => r.data.data)
}

export function getCurrentlyBorrowed() {
  return api.get('/reports/currently-borrowed').then((r) => r.data.data)
}

export function getOverdueBooks() {
  return api.get('/reports/overdue-books').then((r) => r.data.data)
}

export function getStudentHistory(studentId) {
  return api.get(`/reports/student-history/${studentId}`).then((r) => r.data.data)
}

export function getReservationStats() {
  return api.get('/reports/reservation-stats').then((r) => r.data)
}
