import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import CompanySettings from './pages/CompanySettings'
import CreateQuotation from './pages/CreateQuotation'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import QuoteDetails from './pages/QuoteDetails'
import Quotations from './pages/Quotations'
import Templates from './pages/Templates'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="quotations/create" element={<CreateQuotation />} />
        <Route path="quotations/:id" element={<QuoteDetails />} />
        <Route path="customers" element={<Customers />} />
        <Route path="templates" element={<Templates />} />
        <Route path="settings/company" element={<CompanySettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
