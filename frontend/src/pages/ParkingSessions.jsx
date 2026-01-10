import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

function ParkingSessions() {
  const navigate = useNavigate()

  // Check if there's an active parking ticket
  useEffect(() => {
    const activeParking = localStorage.getItem('activeParking')
    if (!activeParking) {
      // Redirect to home if no active ticket
      navigate('/home')
    }
  }, [navigate])

  const sessions = [
    {
      id: '1',
      site_name: 'Phoenix Mall',
      vehicle_plate: 'MH 12 AB 1234',
      status: 'active',
      start_time: '2 hours ago',
      duration: '2h 15m'
    },
    {
      id: '2',
      site_name: 'Central Plaza',
      vehicle_plate: 'MH 14 CD 5678',
      status: 'completed',
      start_time: 'Yesterday',
      duration: '2h 50m'
    }
  ]

  return (
    <div className="w-full bg-gray-100 min-h-full flex flex-col">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Parking Sessions</h1>
      </div>

      <div className="px-5 flex-1 pb-20">
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{session.site_name}</h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                  session.status === 'active' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {session.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="text-gray-800 font-medium">{session.vehicle_plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="text-gray-800 font-medium">{session.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-800 font-medium">{session.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <BottomNav />
      </div>
    </div>
  )
}

export default ParkingSessions
