import { useEffect, useRef, useState } from 'react'
import { Plus, BookOpen, Pencil, Trash2, ImageUp, Search, X } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { useToast } from '../lib/toast'
import { apiErrorMessage } from '../lib/api'
import * as booksApi from '../api/books'
import * as librariesApi from '../api/libraries'

function BookForm({ initial, libraries, onSubmit, onCancel, saving }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [author, setAuthor] = useState(initial?.author || '')
  const [isbn, setIsbn] = useState(initial?.isbn || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [libraryId, setLibraryId] = useState(initial?.library_id || libraries[0]?.id || '')

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { title, author, isbn, category: category || null }
    if (!initial) payload.library_id = libraryId
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-ink-soft mb-1" htmlFor="b-title">
          Title
        </label>
        <input
          id="b-title"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
        />
      </div>
      <div>
        <label className="block text-sm text-ink-soft mb-1" htmlFor="b-author">
          Author
        </label>
        <input
          id="b-author"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-ink-soft mb-1" htmlFor="b-isbn">
            ISBN
          </label>
          <input
            id="b-isbn"
            required
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white font-mono focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
        <div>
          <label className="block text-sm text-ink-soft mb-1" htmlFor="b-category">
            Category
          </label>
          <input
            id="b-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
      </div>

      {!initial && (
        <div>
          <label className="block text-sm text-ink-soft mb-1" htmlFor="b-library">
            Library
          </label>
          <select
            id="b-library"
            required
            value={libraryId}
            onChange={(e) => setLibraryId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            <option value="" disabled>
              Choose a library…
            </option>
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.id}>
                {lib.name}
              </option>
            ))}
          </select>
          {libraries.length === 0 && (
            <p className="text-xs text-rubric mt-1">
              Create a library first before adding books.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 text-sm rounded-md border border-line text-ink-soft hover:bg-paper transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || (!initial && libraries.length === 0)}
className="px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add book'}
        </button>
      </div>
    </form>
  )
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'title', label: 'Title (A–Z)' },
]

export default function Books() {
  const toast = useToast()
  const [books, setBooks] = useState([])
  const [meta, setMeta] = useState(null)
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [covers, setCovers] = useState({}) // local override: book_id -> file_url

  const [filters, setFilters] = useState({ title: '', author: '', isbn: '', category: '' })
  const [sort, setSort] = useState('created_at')
  const [page, setPage] = useState(1)

  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef(null)
  const [uploadTargetId, setUploadTargetId] = useState(null)

  useEffect(() => {
    librariesApi.listLibraries().then(setLibraries).catch(() => {})
  }, [])

  function load() {
    setLoading(true)
    booksApi
      .listBooks({ ...filters, sort, page, per_page: 12 })
      .then((res) => {
        setBooks(res.data)
        setMeta(res.meta)
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Could not load books.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [sort, page]) // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilters(e) {
    e.preventDefault()
    setPage(1)
    load()
  }

  function clearFilters() {
    setFilters({ title: '', author: '', isbn: '', category: '' })
    setPage(1)
    setTimeout(load, 0)
  }

  async function handleSubmit(payload) {
    setSaving(true)
    try {
      if (modal.mode === 'edit') {
        const res = await booksApi.updateBook(modal.book.id, payload)
        toast.success(res.message)
      } else {
        const res = await booksApi.createBook(payload)
        toast.success(res.message)
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save the book.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await booksApi.deleteBook(deleteTarget.id)
      toast.success(res.message)
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not delete the book.'))
    } finally {
      setDeleting(false)
    }
  }

  function triggerUpload(bookId) {
    setUploadTargetId(bookId)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !uploadTargetId) return
    try {
      const res = await booksApi.uploadBookCover(uploadTargetId, file)
      setCovers((prev) => ({ ...prev, [uploadTargetId]: res.file.file_url }))
      toast.success(res.message)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not upload the cover image.'))
    } finally {
      setUploadTargetId(null)
    }
  }

  const libraryName = (id) => libraries.find((l) => l.id === id)?.name || `Library #${id}`

  return (
    <Layout title="Books">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3 mb-5">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-slate mb-1">Title</label>
          <input
            value={filters.title}
            onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-slate mb-1">Author</label>
          <input
            value={filters.author}
            onChange={(e) => setFilters((f) => ({ ...f, author: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-slate mb-1">ISBN</label>
          <input
            value={filters.isbn}
            onChange={(e) => setFilters((f) => ({ ...f, isbn: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white font-mono focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-slate mb-1">Category</label>
          <input
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
        <div>
          <label className="block text-xs text-slate mb-1">Sort</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-md border border-line hover:bg-paper transition-colors"
        >
          <Search size={14} />
          Filter
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate hover:text-ink transition-colors"
        >
          <X size={14} />
          Clear
        </button>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors ml-auto"
        >
          <Plus size={15} />
          New book
        </button>
      </form>

      <div className="bg-card border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Spinner label="Loading books…" />
          </div>
        ) : books.length === 0 ? (
          <EmptyState icon={BookOpen} title="No books match" hint="Try adjusting your filters." />
        ) : (
          <div className="px-5">
            {books.map((book) => {
              const cover = covers[book.id] || book.cover?.file_url
              return (
                <div key={book.id} className="ledger-row py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-13 rounded bg-paper border border-line shrink-0 overflow-hidden flex items-center justify-center">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={14} className="text-slate" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{book.title}</p>
                      <p className="text-xs text-slate truncate">
                        {book.author} ·{' '}
                        <span className="font-mono">{book.isbn}</span>
                        {book.category ? ` · ${book.category}` : ''} · {libraryName(book.library_id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => triggerUpload(book.id)}
                      className="p-2 text-slate hover:text-ink rounded-md hover:bg-paper transition-colors"
                      aria-label={`Upload cover for ${book.title}`}
                      title="Upload cover"
                    >
                      <ImageUp size={15} />
                    </button>
                    <button
                      onClick={() => setModal({ mode: 'edit', book })}
                      className="p-2 text-slate hover:text-ink rounded-md hover:bg-paper transition-colors"
                      aria-label={`Edit ${book.title}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(book)}
                      className="p-2 text-slate hover:text-rubric rounded-md hover:bg-paper transition-colors"
                      aria-label={`Delete ${book.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {!loading && <div className="px-5 border-t border-line"><Pagination meta={meta} onPageChange={setPage} /></div>}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit book' : 'New book'}
      >
        {modal && (
          <BookForm
            initial={modal.book}
            libraries={libraries}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete book"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </Layout>
  )
}
