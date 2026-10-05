import { useEffect, useState } from 'react'
import { isDocxFile, isImageFile, isPdfFile } from '../../utils/templateFileUtils'

const pageCache = new Map()

async function renderPdfPage(url, pageNumber) {
  const cacheKey = `${url}:${pageNumber}`
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)

  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default

  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Unable to load PDF')
  const data = await response.arrayBuffer()
  const document = await pdfjs.getDocument({ data }).promise
  const pageCount = document.numPages
  const page = await document.getPage(Math.min(pageNumber, pageCount))
  const viewport = page.getViewport({ scale: 1.4 })
  const canvas = window.document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport,
  }).promise
  const imageUrl = canvas.toDataURL('image/png')
  const result = { imageUrl, pageCount }
  pageCache.set(cacheKey, result)
  pageCache.set(`${url}:count`, { pageCount })
  return result
}

export function useTemplatePageCount(customTemplate) {
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!customTemplate?.previewUrl || !isPdfFile(customTemplate.fileType)) {
        setPageCount(1)
        return
      }
      try {
        const cached = pageCache.get(`${customTemplate.previewUrl}:count`)
        if (cached) {
          setPageCount(cached.pageCount)
          return
        }
        const result = await renderPdfPage(customTemplate.previewUrl, 1)
        if (!cancelled) setPageCount(result.pageCount)
      } catch {
        if (!cancelled) setPageCount(1)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [customTemplate?.previewUrl, customTemplate?.fileType])

  return pageCount
}

function TemplatePageBackground({ customTemplate, pageNumber, width, height }) {
  const [pdfImage, setPdfImage] = useState('')
  const [pdfError, setPdfError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setPdfImage('')
      setPdfError('')
      if (!customTemplate?.previewUrl || !isPdfFile(customTemplate.fileType)) return
      try {
        const result = await renderPdfPage(customTemplate.previewUrl, pageNumber)
        if (!cancelled) setPdfImage(result.imageUrl)
      } catch {
        if (!cancelled) setPdfError('PDF page preview is limited in this browser.')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [customTemplate?.previewUrl, customTemplate?.fileType, pageNumber])

  if (isImageFile(customTemplate?.fileType || '') && customTemplate?.previewUrl && pageNumber === 1) {
    return (
      <img
        src={customTemplate.previewUrl}
        alt={customTemplate.name}
        className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        draggable={false}
      />
    )
  }

  if (isPdfFile(customTemplate?.fileType || '') && customTemplate?.previewUrl) {
    if (pdfImage) {
      return (
        <img
          src={pdfImage}
          alt={`${customTemplate.name} page ${pageNumber}`}
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
          draggable={false}
        />
      )
    }

    return (
      <div className="absolute inset-0 bg-white">
        {pdfError ? (
          <iframe
            title={`${customTemplate.name} page ${pageNumber}`}
            src={`${customTemplate.previewUrl}#page=${pageNumber}&view=Fit`}
            className="pointer-events-none h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Loading page {pageNumber}…
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-white" style={{ width, height }}>
      {isDocxFile(customTemplate?.fileType || '') && pageNumber === 1 && (
        <div className="m-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
          {customTemplate.fileName} is stored as a reference. Word pages cannot be shown here, so
          fields are placed on a blank A4 page.
        </div>
      )}
    </div>
  )
}

export default TemplatePageBackground
