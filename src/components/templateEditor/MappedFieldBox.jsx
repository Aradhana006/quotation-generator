import { useRef } from 'react'
import MappedFieldView from '../templates/MappedFieldView'

function MappedFieldBox({
  field,
  quotation,
  scale,
  selected,
  onSelect,
  onChange,
  onCommit,
}) {
  const dragRef = useRef(null)

  function beginDrag(event, mode) {
    event.preventDefault()
    event.stopPropagation()
    onSelect(field.id)
    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
    }

    function onMove(moveEvent) {
      if (!dragRef.current) return
      const dx = (moveEvent.clientX - dragRef.current.startX) / scale
      const dy = (moveEvent.clientY - dragRef.current.startY) / scale
      if (dragRef.current.mode === 'move') {
        onChange(field.id, {
          x: Math.max(0, dragRef.current.x + dx),
          y: Math.max(0, dragRef.current.y + dy),
        })
      } else {
        onChange(field.id, {
          width: Math.max(16, dragRef.current.width + dx),
          height: Math.max(12, dragRef.current.height + dy),
        })
      }
    }

    function onUp() {
      dragRef.current = null
      onCommit?.()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={(event) => beginDrag(event, 'move')}
      className={`absolute overflow-visible ${
        selected ? 'z-20 ring-2 ring-sky-500' : 'z-10 ring-1 ring-sky-300/80'
      }`}
      style={{
        left: field.x * scale,
        top: field.y * scale,
        width: field.width * scale,
        height: field.height * scale,
        cursor: 'move',
      }}
    >
      <div className="h-full w-full bg-sky-50/40">
        <MappedFieldView field={field} quotation={quotation} scale={scale} showHidden />
      </div>
      {selected && (
        <button
          type="button"
          aria-label="Resize field"
          onPointerDown={(event) => beginDrag(event, 'resize')}
          className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-se-resize rounded-sm border border-white bg-sky-500"
        />
      )}
    </div>
  )
}

export default MappedFieldBox
