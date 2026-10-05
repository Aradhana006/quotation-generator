import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SELECTED_TEMPLATE } from '../data/builtInTemplates'
import { revokeTemplatePreviewUrl } from '../utils/templateFileUtils'
import { useAuth } from './AuthContext'
import * as templateService from '../services/templateService.js'

const TemplateContext = createContext(null)

export function TemplateProvider({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_SELECTED_TEMPLATE)

  const customTemplates = useMemo(
    () => templates.filter((template) => template.type === 'custom'),
    [templates],
  )

  const refreshTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setTemplatesError('')
    try {
      const data = await templateService.getTemplates()
      setTemplates(data)
    } catch (error) {
      setTemplatesError(error.message || 'Unable to load templates.')
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setTemplates([])
      setTemplatesLoading(false)
      setTemplatesError('')
      return
    }

    refreshTemplates()
  }, [isAuthenticated, authLoading, refreshTemplates])

  async function addCustomTemplate(name, file, onProgress) {
    const saved = await templateService.createTemplate(name, file, onProgress)
    await refreshTemplates()
    return saved
  }

  async function updateCustomTemplate(id, data, onProgress) {
    const saved = await templateService.updateTemplate(id, data, onProgress)
    await refreshTemplates()
    return saved
  }

  async function updateTemplateConfiguration(id, configuration) {
    const saved = await templateService.updateTemplateConfiguration(id, configuration)
    await refreshTemplates()
    return saved
  }

  async function deleteCustomTemplate(id) {
    const templateToDelete = customTemplates.find((item) => item.id === id)
    revokeTemplatePreviewUrl(templateToDelete)
    await templateService.deleteTemplate(id)
    await refreshTemplates()

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
      templates,
      customTemplates,
      templatesLoading,
      templatesError,
      refreshTemplates,
      selectedTemplate,
      addCustomTemplate,
      updateCustomTemplate,
      updateTemplateConfiguration,
      deleteCustomTemplate,
      selectTemplate,
    }),
    [
      templates,
      customTemplates,
      templatesLoading,
      templatesError,
      refreshTemplates,
      selectedTemplate,
    ],
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
