import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SELECTED_TEMPLATE } from '../data/builtInTemplates'
import { STORAGE_KEYS } from '../data/defaults'
import { revokeTemplatePreviewUrl } from '../utils/templateFileUtils'
import * as templateService from '../services/templateService.js'

const TemplateContext = createContext(null)

function loadStoredTemplates() {
  return templateService.getCustomTemplates()
}

export function TemplateProvider({ children }) {
  const [customTemplates, setCustomTemplates] = useState(loadStoredTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_SELECTED_TEMPLATE)

  useEffect(() => {
    templateService.saveCustomTemplates(customTemplates)
  }, [customTemplates])

  function addCustomTemplate(template) {
    setCustomTemplates((current) => [...current, template])
  }

  function deleteCustomTemplate(id) {
    setCustomTemplates((current) => {
      const templateToDelete = current.find((item) => item.id === id)
      revokeTemplatePreviewUrl(templateToDelete)
      return current.filter((item) => item.id !== id)
    })

    setSelectedTemplate((current) => {
      if (current.type === 'custom' && current.id === id) {
        return DEFAULT_SELECTED_TEMPLATE
      }
      return current
    })
  }

  function selectTemplate(template) {
    setSelectedTemplate(template)
  }

  const value = useMemo(
    () => ({
      customTemplates,
      selectedTemplate,
      addCustomTemplate,
      deleteCustomTemplate,
      selectTemplate,
    }),
    [customTemplates, selectedTemplate],
  )

  return (
    <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
  )
}

export function useTemplates() {
  const context = useContext(TemplateContext)
  if (!context) {
    throw new Error('useTemplates must be used within TemplateProvider')
  }
  return context
}
