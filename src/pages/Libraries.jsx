import { useEffect, useState } from 'react'
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'
import { apiErrorMessage } from '../lib/api'
import * as librariesApi from '../api/libraries'

function LibraryForm({ initial, librarianId, onSubmit, onCancel, saving }) {
  const [name, setName] = useState(initial?.name || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ name, librarian_id: librarianId })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm text-ink-soft mb-1" htmlFor="lib-name">
        Library name
      </label>
      <input
        id="lib-name"
        required
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Main Campus Library"
        className="w-full px-3 py-2 mb-4 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
      />
      <p className="text-xs text-slate mb-5">
        Assigned to you as the managing librarian (ID {librarianId}).
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 text-sm rounded-md border border-line text-ink-soft hover:bg-paper transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
className="px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add library'}
        </button>
      </div>
    </form>
  )
}

export default function Libraries() {
  const { librarian } = useAuth()
  const toast = useToast()
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', library? }
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    librariesApi
      .listLibraries()
      .then(setLibraries)
      .catch((err) => toast.error(apiErrorMessage(err, 'Could not load libraries.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(payload) {
    setSaving(true)
    try {
      if (modal.mode === 'edit') {
        const res = await librariesApi.updateLibrary(modal.library.id, payload)
        toast.success(res.message)
      } else {
        const res = await librariesApi.createLibrary(payload)
        toast.success(res.message)
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save the library.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await librariesApi.deleteLibrary(deleteTarget.id)
      toast.success(res.message)
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not delete the library.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout title="Libraries">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate">Branches and rooms that hold your catalogued books.</p>
        <button
          onClick={() => setModal({ mode: 'create' })}
className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors"
        >
          <Plus size={15} />
          New library
        </button>
      </div>

      <div className="bg-card border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Spinner label="Loading libraries…" />
          </div>
        ) : libraries.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No libraries yet"
            hint="Add your first library branch to start cataloguing books."
            action={
<button
                onClick={() => setModal({ mode: 'create' })}
                className="px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors"
              >
                Add a library
              </button>
            }
          />
        ) : (
          <div className="px-5">
            {libraries.map((lib) => (
              <div key={lib.id} className="ledger-row py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-slate" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{lib.name}</p>
                    <p className="text-xs text-slate font-mono">Librarian ID {lib.librarian_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModal({ mode: 'edit', library: lib })}
                    className="p-2 text-slate hover:text-ink rounded-md hover:bg-paper transition-colors"
                    aria-label={`Edit ${lib.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(lib)}
                    className="p-2 text-slate hover:text-rubric rounded-md hover:bg-paper transition-colors"
                    aria-label={`Delete ${lib.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit library' : 'New library'}
      >
        {modal && (
          <LibraryForm
            initial={modal.library}
            librarianId={modal.library?.librarian_id ?? librarian?.id}
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
        title="Delete library"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </Layout>
  )
}
