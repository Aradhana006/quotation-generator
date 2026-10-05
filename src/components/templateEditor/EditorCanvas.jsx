import { A4_HEIGHT, A4_WIDTH } from '../../data/templateFields'
import { getPageFields } from '../../utils/templateConfiguration'
import TemplatePageBackground from '../templates/TemplatePageBackground'
import MappedFieldBox from './MappedFieldBox'

function EditorCanvas({
  customTemplate,
  configuration,
  currentPage,
  zoom,
  selectedFieldId,
  quotation,
  onSelectField,
  onChangeField,
  onCommitField,
}) {
  const fields = getPageFields(configuration, currentPage)

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-slate-200">
      <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-4 py-2 text-xs text-slate-500">
        <span>A4 portrait · page {currentPage}</span>
        <span>
          Sample preview · coordinates are PDF points (origin top-left)
          {currentPage > 1 ? ' · extra pages are blank A4 unless the upload has that page' : ''}
        </span>
      </div>
      <div className="flex flex-1 justify-center overflow-auto p-6" onPointerDown={() => onSelectField(null)}>
        <div
          className="relative shrink-0 bg-white shadow-xl"
          style={{ width: A4_WIDTH * zoom, height: A4_HEIGHT * zoom }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <TemplatePageBackground
            customTemplate={customTemplate}
            pageNumber={currentPage}
            width={A4_WIDTH * zoom}
            height={A4_HEIGHT * zoom}
          />
          {fields.map((field) => (
            <MappedFieldBox
              key={field.id}
              field={field}
              quotation={quotation}
              scale={zoom}
              selected={selectedFieldId === field.id}
              onSelect={onSelectField}
              onChange={onChangeField}
              onCommit={onCommitField}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default EditorCanvas
