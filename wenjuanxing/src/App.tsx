import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage, HomePage } from './pages/Home'
import { DashboardPage } from './pages/Dashboard'
import { CreatePage, PricingPage, TemplatesPage } from './pages/Create'
import { EditorPage } from './pages/Editor'
import { FillPage, ThanksPage } from './pages/Fill'
import { StatsPage } from './pages/Stats'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/edit/:id" element={<EditorPage />} />
      <Route path="/stats/:id" element={<StatsPage />} />
      <Route path="/s/:id" element={<FillPage />} />
      <Route path="/vm/:id" element={<FillPage />} />
      <Route path="/s/:id/thanks" element={<ThanksPage />} />
      <Route path="/vm/:id/thanks" element={<ThanksPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
