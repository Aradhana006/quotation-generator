import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider } from './context/AuthContext'
import { QuotationProvider } from './context/QuotationContext'
import { TemplateProvider } from './context/TemplateContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
          <QuotationProvider>
            <TemplateProvider>
              <App />
            </TemplateProvider>
          </QuotationProvider>
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
