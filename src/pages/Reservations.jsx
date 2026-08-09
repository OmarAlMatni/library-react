import { useEffect, useState } from 'react'
import { Plus, CalendarClock, Check, X as XIcon } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import StudentPicker from '../components/StudentPicker'
import BookPicker from '../components/BookPicker'
import { useToast } from '../lib/toast'
import { apiErrorMessage } from '../lib/api'
import * as reservationsApi from '../api/reservations'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
]

function CreateReservationForm({ onSubmit, onCancel, saving }) {
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
          {saving ? 'Reserving…' : 'Reserve book'}
        </button>
      </div>
    </form>
  )
}

export default function Reservations() {
  const toast = useToast()
  const [tab, setTab] = useState('all')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actingId, setActingId] = useState(null)

  function load() {
    setLoading(true)
    const call =
      tab === 'pending' ? reservationsApi.listPendingReservations() : reservationsApi.listReservations()
    call
      .then(setReservations)
      .catch((err) => toast.error(apiErrorMessage(err, 'Could not load reservations.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(payload) {
    setSaving(true)
    try {
      const res = await reservationsApi.createReservation(payload)
      toast.success(res.message)
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not create the reservation.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleFulfill(id) {
    setActingId(id)
    try {
      const res = await reservationsApi.fulfillReservation(id)
      toast.success(res.message)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not fulfill the reservation.'))
    } finally {
      setActingId(null)
    }
  }

  async function handleCancel(id) {
    setActingId(id)
    try {
      const res = await reservationsApi.cancelReservation(id)
      toast.success(res.message)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not cancel the reservation.'))
    } finally {
      setActingId(null)
    }
  }

  return (
    <Layout title="Reservations">
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
          New reservation
        </button>
      </div>

      <div className="bg-card border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Spinner label="Loading reservations…" />
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No reservations"
            hint={tab === 'pending' ? 'Nothing is waiting for pickup.' : 'Reservations will show up here.'}
          />
        ) : (
          <div className="px-5">
            {reservations.map((r) => (
              <div key={r.id} className="ledger-row py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{r.book?.title}</p>
                  <p className="text-xs text-slate font-mono truncate">
                    {r.student?.full_name || `Student #${r.student_id}`} · reserved {r.reservation_date}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={r.status} />
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleFulfill(r.id)}
                        disabled={actingId === r.id}
                        className="p-1.5 text-forest hover:bg-forest-soft rounded-md transition-colors disabled:opacity-50"
                        title="Fulfill (hand over book)"
                        aria-label="Fulfill reservation"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={actingId === r.id}
                        className="p-1.5 text-rubric hover:bg-rubric-soft rounded-md transition-colors disabled:opacity-50"
                        title="Cancel reservation"
                        aria-label="Cancel reservation"
                      >
                        <XIcon size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New reservation">
        <CreateReservationForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </Layout>
  )
}
