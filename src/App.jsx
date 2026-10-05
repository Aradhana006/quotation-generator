import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import CompanySettings from './pages/CompanySettings'
import CreateQuotation from './pages/CreateQuotation'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Products from './pages/Products'
import PublicQuotationView from './pages/PublicQuotationView'
import QuoteDetails from './pages/QuoteDetails'
import Quotations from './pages/Quotations'
import Register from './pages/Register'
import TemplateEditor from './pages/TemplateEditor'
import Templates from './pages/Templates'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/quote/view/:token" element={<PublicQuotationView />} />

      <Route element={<ProtectedRoute />}>
        <Route path="templates/:id/edit" element={<TemplateEditor />} />
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/create" element={<CreateQuotation />} />
          <Route path="quotations/:id/edit" element={<CreateQuotation />} />
          <Route path="quotations/:id" element={<QuoteDetails />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings/company" element={<CompanySettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
