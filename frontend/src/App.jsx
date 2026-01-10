import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MobileFrame from './components/MobileFrame'
import Home from './pages/Home'
import History from './pages/History'
import Settings from './pages/Settings'
import ParkingSessions from './pages/ParkingSessions'
import ScanQR from './pages/ScanQR'
import ConfirmParking from './pages/ConfirmParking'
import ParkingTicket from './pages/ParkingTicket'
import RetrievalProgress from './pages/RetrievalProgress'

function App() {
  return (
    <Router>
      <MobileFrame>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/scan-qr" element={<ScanQR />} />
          <Route path="/confirm-parking" element={<ConfirmParking />} />
          <Route path="/parking-ticket" element={<ParkingTicket />} />
          <Route path="/retrieval-progress" element={<RetrievalProgress />} />
          <Route path="/sessions" element={<ParkingSessions />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </MobileFrame>
    </Router>
  )
}

export default App

