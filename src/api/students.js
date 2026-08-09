import { api } from '../lib/api'

export function searchStudents(query) {
  return api.get('/students/search', { params: { query } }).then((r) => r.data.data)
}

export function getStudent(id) {
  return api.get(`/students/${id}`).then((r) => r.data.data)
}
