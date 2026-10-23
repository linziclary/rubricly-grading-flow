import { Navigate, Route, Routes } from 'react-router-dom'
import AssignmentsList from './pages/AssignmentsList'
import ComponentGallery from './pages/ComponentGallery'
import Dashboard from './pages/Dashboard'
import GradePage from './pages/Grade'
import Roster from './pages/Roster'
import { GradingProvider } from './state/grading'

export default function App() {
  return (
    <GradingProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assignments" element={<AssignmentsList />} />
        <Route path="/assignments/9-1-3" element={<Roster />} />
        <Route path="/assignments/9-1-3/grade/:studentId" element={<GradePage />} />
        <Route path="/components" element={<ComponentGallery />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GradingProvider>
  )
}
