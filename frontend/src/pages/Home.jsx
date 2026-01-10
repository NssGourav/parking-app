import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Car, Camera, MapPin, Clock, ArrowRight, ParkingCircle } from 'lucide-react'
import BottomNav from '../components/BottomNav'

function Home() {
  const navigate = useNavigate()
  const [recentParking, setRecentParking] = useState([])
  const [activeParking, setActiveParking] = useState(null)

  // Calculate parking duration
  const calculateDuration = (startTime) => {
    if (!startTime) return '0m'
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now - start
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  useEffect(() => {
    // Load active parking from localStorage
    const storedActiveParking = localStorage.getItem('activeParking')
    if (storedActiveParking) {
      const parking = JSON.parse(storedActiveParking)
      // Calculate current duration
      parking.duration = calculateDuration(parking.startTime)
      setActiveParking(parking)
    }

    const dummyData = [
      {
        id: '1',
        site_name: 'Phoenix Mall',
        location: 'Lower Parel, Mumbai',
        cost: 180,
        status: 'completed',
        date: '8 Dec 2025',
        vehicle: 'MH 12 AB 1234',
        duration: '4h 15m'
      },
      {
        id: '2',
        site_name: 'Central Plaza',
        location: 'Andheri West, Mumbai',
        cost: 120,
        status: 'completed',
        date: '5 Dec 2025',
        vehicle: 'MH 14 CD 5678',
        duration: '2h 50m'
      },
      {
        id: '3',
        site_name: 'City Center Mall',
        location: 'Bandra East, Mumbai',
        cost: 200,
        status: 'completed',
        date: '3 Dec 2025',
        vehicle: 'MH 12 AB 1234',
        duration: '4h 30m'
      }
    ]
    setRecentParking(dummyData)
  }, [])

  // Update duration every minute
  useEffect(() => {
    if (!activeParking) return
    
    const interval = setInterval(() => {
      setActiveParking(prev => {
        if (!prev) return null
        return {
          ...prev,
          duration: calculateDuration(prev.startTime)
        }
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [activeParking])

  return (
    <div className="w-full bg-gray-100 min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 text-white px-5 pt-12 pb-6">
        <h1 className="text-3xl font-bold mb-2">Smart Parking</h1>
        <p className="text-base opacity-90 mb-4">Welcome back!</p>
        
        {/* Premium Banner */}
        <div className="bg-black bg-opacity-40 rounded-xl p-4 mt-4 flex items-center justify-between relative overflow-hidden">
          <div className="flex-1 flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold">#1 IN INDIA</span>
            </div>
            <div className="text-xs font-semibold">Premium Parking Solution</div>
            <div className="text-xs opacity-90">Trusted by 1M+ users nationwide</div>
          </div>
          <Car className="w-8 h-8 relative z-10" />
        </div>
      </div>

      {/* Scan to Park Card */}
      <div 
        onClick={() => navigate('/scan-qr')}
        className="mx-5 mt-5 bg-amber-50 rounded-xl p-5 flex items-center gap-4 shadow-sm border border-amber-100 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Camera className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Scan to Park</h3>
          <p className="text-sm text-gray-600">Scan QR code at parking entrance</p>
        </div>
        <ArrowRight className="w-6 h-6 text-indigo-500" />
      </div>

      {/* Active Parking Section */}
      {activeParking && (
        <div className="px-5 mt-5">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Parking</h2>
          <div 
            onClick={() => navigate('/parking-ticket', { 
              state: { 
                vehicle: { model: activeParking.vehicleModel, license_plate: activeParking.vehicle },
                location: activeParking.location,
                amount: activeParking.amount
              }
            })}
            className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ParkingCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{activeParking.location}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{activeParking.entryTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  <span>{activeParking.vehicle}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Parked - {activeParking.duration || (activeParking.startTime ? calculateDuration(activeParking.startTime) : '0m')}
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-green-600" />
          </div>
        </div>
      )}

      {/* Recent Parking Section */}
      <div className="px-5 mt-6 flex-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Parking</h2>
        <div className="space-y-3 pb-20">
          {recentParking.map((parking) => (
            <div key={parking.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{parking.site_name}</h3>
                <span className="text-lg font-bold text-gray-800">₹{parking.cost}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{parking.location}</span>
              </div>
              <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize">
                {parking.status}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{parking.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  <span>{parking.vehicle}</span>
                </div>
                <div>
                  <span>{parking.duration}</span>
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

export default Home
