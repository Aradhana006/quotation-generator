import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EditorCanvas from '../components/templateEditor/EditorCanvas'
import FieldPalette from '../components/templateEditor/FieldPalette'
import FieldProperties from '../components/templateEditor/FieldProperties'
import UnsavedChangesDialog from '../components/templateEditor/UnsavedChangesDialog'
import { SAMPLE_QUOTATION } from '../data/sampleQuotation'
import { useTemplatePageCount } from '../components/templates/TemplatePageBackground'
import { useTemplates } from '../context/TemplateContext'
import { getBuiltInTemplate } from '../data/builtInTemplates'
import * as templateService from '../services/templateService'
import {
  createMappedField,
  findMappedField,
  normalizeTemplateConfiguration,
  setConfigurationPageCount,
  upsertPageFields,
} from '../utils/templateConfiguration'

function snapshot(config) {
  return JSON.stringify(config)
}

function TemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshTemplates } = useTemplates()

  const builtIn = getBuiltInTemplate(id)
  const [template, setTemplate] = useState(null)
  const [configuration, setConfiguration] = useState(normalizeTemplateConfiguration({}))
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot(normalizeTemplateConfiguration({})))
  const [history, setHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const [zoom, setZoom] = useState(0.85)
  const [loading, setLoading] = useState(!builtIn)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const configurationRef = useRef(configuration)
  configurationRef.current = configuration

  const detectedPages = useTemplatePageCount(template)
  const [didSyncPdfPages, setDidSyncPdfPages] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const isDirty = snapshot(configuration) !== savedSnapshot
  const selectedField = useMemo(
    () => findMappedField(configuration, selectedFieldId),
    [configuration, selectedFieldId],
  )

  useEffect(() => {
    if (builtIn) return undefined

    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await templateService.getTemplate(id)
        if (cancelled) return
        if (data.type !== 'custom') {
          setError('Built-in templates cannot be edited.')
          setTemplate(null)
          return
        }
        const next = normalizeTemplateConfiguration(data.configuration)
        setTemplate(data)
        setConfiguration(next)
        setSavedSnapshot(snapshot(next))
        setHistory([next])
        setCurrentPage(1)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Template not found.')
          setTemplate(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, builtIn])

  useEffect(() => {
    if (!template || didSyncPdfPages || detectedPages <= 1) return
    if ((configuration.pageCount || 1) >= detectedPages) {
      setDidSyncPdfPages(true)
      return
    }
    const hasFields = configuration.pages.some((page) => page.fields.length > 0)
    if (hasFields) {
      setDidSyncPdfPages(true)
      return
    }
    const next = setConfigurationPageCount(configuration, detectedPages)
    setConfiguration(next)
    setHistory([next])
    setDidSyncPdfPages(true)
  }, [detectedPages, template, configuration, didSyncPdfPages])

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selectedFieldId) {
        event.preventDefault()
        duplicateField(selectedFieldId)
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedFieldId) {
        const tag = event.target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        event.preventDefault()
        deleteField(selectedFieldId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    function onBeforeUnload(event) {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function recordHistory(next) {
    configurationRef.current = next
    setHistory((current) => [...current.slice(-29), next])
    setConfiguration(next)
  }

  function addField(fieldKey) {
    const offset = getPageFieldsCount() * 12
    const field = createMappedField(fieldKey, currentPage, offset)
    recordHistory(upsertPageFields(configuration, currentPage, (fields) => [...fields, field]))
    setSelectedFieldId(field.id)
  }

  function getPageFieldsCount() {
    return configuration.pages.find((page) => page.page === currentPage)?.fields.length || 0
  }

  function changeField(fieldId, partial) {
    setConfiguration((current) => {
      const next = upsertPageFields(current, currentPage, (fields) =>
        fields.map((field) => (field.id === fieldId ? { ...field, ...partial } : field)),
      )
      configurationRef.current = next
      return next
    })
  }

  function commitHistory() {
    setHistory((current) => [...current.slice(-29), configurationRef.current])
  }

  function deleteField(fieldId) {
    recordHistory(
      upsertPageFields(configuration, currentPage, (fields) =>
        fields.filter((field) => field.id !== fieldId),
      ),
    )
    setSelectedFieldId(null)
  }

  function duplicateField(fieldId) {
    const source = findMappedField(configuration, fieldId)
    if (!source) return
    const copy = {
      ...source,
      id: crypto.randomUUID(),
      x: source.x + 16,
      y: source.y + 16,
      columns: source.columns ? source.columns.map((column) => ({ ...column })) : undefined,
    }
    recordHistory(
      upsertPageFields(configuration, currentPage, (fields) => [...fields, copy]),
    )
    setSelectedFieldId(copy.id)
  }

  function undo() {
    setHistory((current) => {
      if (current.length < 2) return current
      const nextHistory = current.slice(0, -1)
      setConfiguration(nextHistory[nextHistory.length - 1])
      return nextHistory
    })
  }

  async function handleSave() {
    setSaving(true)
    setSaveMessage('')
    setError('')
    try {
      const saved = await templateService.updateTemplateConfiguration(id, configuration)
      const next = normalizeTemplateConfiguration(saved.configuration)
      setTemplate(saved)
      setConfiguration(next)
      setSavedSnapshot(snapshot(next))
      setSaveMessage('Template saved.')
      await refreshTemplates()
    } catch (saveError) {
      setError(saveError.message || 'Unable to save template.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (isDirty) {
      setLeaveOpen(true)
      return
    }
    navigate('/templates')
  }

  if (builtIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Built-in templates cannot be edited.</h1>
          <p className="mt-2 text-sm text-slate-500">
            Modern, Professional, and Classic are code-defined layouts. Upload a custom format to
            place your own fields.
          </p>
          <Link to="/templates" className="mt-6 inline-block text-sm font-medium text-slate-800 underline">
            Back to Templates
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading template editor...
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Template not found</h1>
          <p className="mt-2 text-sm text-slate-500">{error || 'This custom template could not be opened.'}</p>
          <Link to="/templates" className="mt-6 inline-block text-sm font-medium text-slate-800 underline">
            Back to Templates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Template editor</p>
          <h1 className="text-lg font-semibold text-slate-900">{template.name}</h1>
          <p className="text-xs text-slate-500">
            Sample preview uses BaaS Systems / ADNA Automation / QT-2026-001
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Pages
            <input
              type="number"
              min={1}
              max={20}
              value={configuration.pageCount}
              onChange={(event) => {
                const next = setConfigurationPageCount(configuration, Number(event.target.value))
                recordHistory(next)
                if (currentPage > next.pageCount) setCurrentPage(next.pageCount)
              }}
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Zoom
            <input
              type="range"
              min={50}
              max={130}
              value={Math.round(zoom * 100)}
              onChange={(event) => setZoom(Number(event.target.value) / 100)}
            />
          </label>
          <button
            type="button"
            onClick={undo}
            disabled={history.length < 2}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </header>

      {(error || saveMessage) && (
        <div
          className={`border-b px-4 py-2 text-sm ${
            error ? 'border-red-100 bg-red-50 text-red-700' : 'border-green-100 bg-green-50 text-green-700'
          }`}
        >
          {error || saveMessage}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
        {configuration.pages.map((page) => (
          <button
            key={page.page}
            type="button"
            onClick={() => {
              setCurrentPage(page.page)
              setSelectedFieldId(null)
            }}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              currentPage === page.page
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Page {page.page}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">A4 · Portrait · Uploaded document background</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <FieldPalette onAddField={addField} />
        <EditorCanvas
          customTemplate={template}
          configuration={configuration}
          currentPage={currentPage}
          zoom={zoom}
          selectedFieldId={selectedFieldId}
          quotation={SAMPLE_QUOTATION}
          onSelectField={setSelectedFieldId}
          onChangeField={changeField}
          onCommitField={commitHistory}
        />
        <FieldProperties
          field={selectedField}
          onChange={changeField}
          onDelete={deleteField}
          onDuplicate={duplicateField}
        />
      </div>

      <UnsavedChangesDialog
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={() => {
          setLeaveOpen(false)
          setSavedSnapshot(snapshot(configuration))
          navigate('/templates')
        }}
      />
    </div>
  )
}

export default TemplateEditor
