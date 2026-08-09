import { api } from '../lib/api'

// filters: { title, author, isbn, category, sort, per_page, page }
export function listBooks(filters = {}) {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params[key] = value
  })
  return api.get('/books', { params }).then((r) => r.data) // { data, links, meta }
}

export function getBook(id) {
  return api.get(`/books/${id}`).then((r) => r.data.data)
}

export function createBook(payload) {
  return api.post('/books', payload).then((r) => r.data)
}

export function updateBook(id, payload) {
  return api.put(`/books/${id}`, payload).then((r) => r.data)
}

export function deleteBook(id) {
  return api.delete(`/books/${id}`).then((r) => r.data)
}

export function uploadBookCover(id, file) {
  const form = new FormData()
  form.append('cover', file)
  return api
    .post(`/books/${id}/upload-cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}
