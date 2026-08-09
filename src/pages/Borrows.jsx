import { useEffect, useState } from 'react'
import { Plus, ArrowLeftRight, Undo2 } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import StudentPicker from '../components/StudentPicker'
import BookPicker from '../components/BookPicker'
import { useToast } from '../lib/toast'
import { apiErrorMessage } from '../lib/api'
import * as borrowsApi from '../api/borrows'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'returned', label: 'Returned' },
]

function CreateBorrowForm({ onSubmit, onCancel, saving }) {
  const [student, setStudent] = useState(null)
  const [book, setBook] = useState(null)
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!student) errs.student = 'Select a student.'
    if (!book) errs.book = 'Select a book.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    onSubmit({ student_id: student.id, book_id: book.id })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StudentPicker value={student} onChange={setStudent} error={errors.student} />
      <BookPicker value={book} onChange={setBook} error={errors.book} />
      <p className="text-xs text-slate">Due date is set automatically to 14 days from today.</p>
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
          disabled={saving}
className="px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {saving ? 'Recording…' : 'Record borrow'}
        </button>
      </div>
    </form>
  )
}

export default function Borrows() {
  const toast = useToast()
  const [tab, setTab] = useState('all')
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actingId, setActingId] = useState(null)

  function load() {
    setLoading(true)
    const call = {
      all: borrowsApi.listBorrows,
      active: borrowsApi.listActiveBorrows,
      overdue: borrowsApi.listOverdueBorrows,
      returned: borrowsApi.listReturnedBorrows,
    }[tab]()
    call
      .then(setBorrows)
      .catch((err) => toast.error(apiErrorMessage(err, 'Could not load borrows.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(payload) {
    setSaving(true)
    try {
      const res = await borrowsApi.createBorrow(payload)
      toast.success(res.message)
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not record the borrow.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleReturn(id) {
    setActingId(id)
    try {
      const res = await borrowsApi.returnBorrow(id)
      toast.success(res.message)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not mark the book as returned.'))
    } finally {
      setActingId(null)
    }
  }

  function statusOf(b) {
    if (b.return_date) return 'returned'
    return b.is_overdue ? 'overdue' : 'active'
  }

  return (
    <Layout title="Borrows">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-card border border-line rounded-md p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 text-sm rounded transition-colors ${
tab === t.key ? 'bg-ink dark:bg-slate-800 text-white' : 'text-ink-soft hover:bg-paper'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors"
        >
          <Plus size={15} />
          New borrow
        </button>
      </div>

      <div className="bg-card border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Spinner label="Loading borrows…" />
          </div>
        ) : borrows.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="Nothing here" hint="Borrow records will show up here." />
        ) : (
          <div className="px-5">
            {borrows.map((b) => {
              const status = statusOf(b)
              return (
                <div key={b.id} className="ledger-row py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{b.book?.title}</p>
                    <p className="text-xs text-slate font-mono truncate">
                      {b.student?.full_name || `Student #${b.student_id}`} · borrowed {b.borrow_date} · due{' '}
                      {b.due_date}
                      {b.return_date ? ` · returned ${b.return_date}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={status} />
                    {!b.return_date && (
                      <button
                        onClick={() => handleReturn(b.id)}
                        disabled={actingId === b.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border border-line hover:bg-paper transition-colors disabled:opacity-50"
                        title="Mark as returned"
                      >
                        <Undo2 size={13} />
                        Return
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New borrow">
        <CreateBorrowForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </Layout>
  )
}
