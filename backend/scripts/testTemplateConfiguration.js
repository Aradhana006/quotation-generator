import { validateTemplateConfiguration } from '../utils/templateConfiguration.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const valid = validateTemplateConfiguration({
  pageSize: 'A4',
  orientation: 'portrait',
  pageCount: 2,
  pages: [
    {
      page: 1,
      fields: [
        {
          id: 'f1',
          field: 'company.name',
          x: 100,
          y: 50,
          width: 300,
          height: 30,
          fontSize: 18,
          fontWeight: 'bold',
          alignment: 'left',
          color: '#111827',
        },
        {
          id: 'f2',
          field: 'items.table',
          x: 40,
          y: 240,
          width: 500,
          height: 160,
          fontSize: 9,
          columns: [{ key: 'description', label: 'Description', width: 250 }],
        },
      ],
    },
  ],
})
assert(!valid.error, valid.error)
assert(valid.configuration.pages.length === 2, 'page 2 should be created')
assert(valid.configuration.pages[0].fields[1].columns[0].key === 'description', 'table columns kept')

const rejected = [
  validateTemplateConfiguration(null),
  validateTemplateConfiguration({ pages: 'nope' }),
  validateTemplateConfiguration({ pages: [{ page: 1, fields: [{ field: 'database.password', x: 1, y: 1, width: 20, height: 20 }] }] }),
  validateTemplateConfiguration({ pages: [{ page: 1, fields: [{ field: 'company.name', x: 'left', y: 1, width: 20, height: 20 }] }] }),
  validateTemplateConfiguration({ pageSize: 'Letter' }),
]

rejected.forEach((result, index) => {
  assert(result.error, `case ${index} should be rejected`)
})

console.log('Template configuration validation passed.')
