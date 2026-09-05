import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import CompanySettingsPage from './pages/CompanySettingsPage'
import CreateQuotationPage from './pages/CreateQuotationPage'
import CustomersPage from './pages/CustomersPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import QuoteDetailsPage from './pages/QuoteDetailsPage'
import QuotationsPage from './pages/QuotationsPage'
import TemplatesPage from './pages/TemplatesPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/new" element={<CreateQuotationPage />} />
        <Route path="quotations/:id" element={<QuoteDetailsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="settings/company" element={<CompanySettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
