import { A4_HEIGHT, A4_WIDTH } from '../../data/templateFields'
import { isImageFile, isPdfFile } from '../../utils/templateFileUtils'
import { normalizeTemplateConfiguration } from '../../utils/templateConfiguration'
import MappedFieldView from './MappedFieldView'
import TemplatePageBackground from './TemplatePageBackground'

function CustomTemplateRenderer({
  quotation,
  configuration,
  customTemplate,
  scale = 0.72,
  showHidden = false,
}) {
  const normalized = normalizeTemplateConfiguration(configuration)

  return (
    <div className="space-y-6">
      {normalized.pages.map((page) => (
        <div
          key={page.page}
          className="relative overflow-hidden bg-white shadow-sm"
          style={{
            width: A4_WIDTH * scale,
            height: A4_HEIGHT * scale,
          }}
        >
          <TemplatePageBackground
            customTemplate={customTemplate}
            pageNumber={page.page}
            width={A4_WIDTH * scale}
            height={A4_HEIGHT * scale}
          />
          {page.fields.map((field) => (
            <div
              key={field.id}
              className="absolute overflow-hidden"
              style={{
                left: field.x * scale,
                top: field.y * scale,
                width: field.width * scale,
                height: field.height * scale,
              }}
            >
              <MappedFieldView
                field={field}
                quotation={quotation}
                scale={scale}
                showHidden={showHidden}
              />
            </div>
          ))}
        </div>
      ))}
      {!isImageFile(customTemplate?.fileType || '') && !isPdfFile(customTemplate?.fileType || '') && (
        <p className="text-xs text-slate-500">
          This file type is stored as a reference. Fields are placed on A4 pages until a mapped
          preview of the original format is available.
        </p>
      )}
    </div>
  )
}

export default CustomTemplateRenderer
