import { useState } from 'react'
import { isValidEmail } from '../../utils/emailValidation'
import { inputClassName, labelClassName } from '../quotation/formStyles'

const COPY = {
  accept: {
    title: 'Accept Quotation',
    confirm: 'Are you sure you want to accept this quotation?',
    submit: 'Accept Quotation',
    commentLabel: 'Comment',
    commentRequired: false,
  },
  reject: {
    title: 'Reject Quotation',
    confirm: 'Are you sure you want to reject this quotation?',
    submit: 'Reject Quotation',
    commentLabel: 'Reason',
    commentRequired: true,
  },
  changes: {
    title: 'Request Changes',
    confirm: 'Submit your requested changes to the business.',
    submit: 'Submit Request',
    commentLabel: 'Requested Changes',
    commentRequired: true,
  },
}

function CustomerActionModal({ variant, isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const copy = COPY[variant]

  if (!isOpen || !copy) return null

  async function handleSubmit() {
    if (isSubmitting) return
    if (email.trim() && !isValidEmail(email)) {
      setError('Email format is invalid.')
      return
    }
    if (copy.commentRequired && !comment.trim()) {
      setError(`${copy.commentLabel} is required.`)
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await onSubmit({
        customerName: name.trim(),
        customerEmail: email.trim(),
        comment: comment.trim(),
      })
    } catch (err) {
      setError(err.message || 'Unable to submit response.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{copy.confirm}</p>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label htmlFor="customerName" className={labelClassName}>Name</label>
            <input
              id="customerName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="customerEmail" className={labelClassName}>Email</label>
            <input
              id="customerEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="customerComment" className={labelClassName}>
              {copy.commentLabel}
              {copy.commentRequired ? '' : ' (optional)'}
            </label>
            <textarea
              id="customerComment"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className={inputClassName}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              if (!isSubmitting) onClose()
            }}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-h-10 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : copy.submit}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerActionModal
