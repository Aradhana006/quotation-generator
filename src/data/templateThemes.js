/** Shared minimal quotation themes — white page, subtle accent only. */

const BASE_FONT = 'Arial, Helvetica, "Segoe UI", sans-serif'

export const TEMPLATE_THEMES = {
  modern: {
    id: 'modern',
    fontFamily: BASE_FONT,
    headingFont: BASE_FONT,
    colors: {
      accent: '#0f172a',
      accentSoft: '#f1f5f9',
      text: '#0f172a',
      muted: '#475569',
      line: '#cbd5e1',
      pageBg: '#ffffff',
      panelBg: '#ffffff',
      tableBorder: '#111827',
      tableHeaderBg: '#ffffff',
      tableHeaderText: '#0f172a',
      footerBg: '#ffffff',
      footerText: '#334155',
      watermark: 'transparent',
    },
  },
  professional: {
    id: 'professional',
    fontFamily: BASE_FONT,
    headingFont: BASE_FONT,
    colors: {
      accent: '#0f172a',
      accentSoft: '#f1f5f9',
      text: '#0f172a',
      muted: '#475569',
      line: '#cbd5e1',
      pageBg: '#ffffff',
      panelBg: '#ffffff',
      tableBorder: '#111827',
      tableHeaderBg: '#ffffff',
      tableHeaderText: '#0f172a',
      footerBg: '#ffffff',
      footerText: '#334155',
      watermark: 'transparent',
    },
  },
  classic: {
    id: 'classic',
    fontFamily: BASE_FONT,
    headingFont: BASE_FONT,
    colors: {
      accent: '#1c1917',
      accentSoft: '#f5f5f4',
      text: '#1c1917',
      muted: '#57534e',
      line: '#d6d3d1',
      pageBg: '#ffffff',
      panelBg: '#ffffff',
      tableBorder: '#1c1917',
      tableHeaderBg: '#ffffff',
      tableHeaderText: '#1c1917',
      footerBg: '#ffffff',
      footerText: '#44403c',
      watermark: 'transparent',
    },
  },
}

export function getTemplateTheme(variant = 'modern') {
  return TEMPLATE_THEMES[variant] || TEMPLATE_THEMES.modern
}
