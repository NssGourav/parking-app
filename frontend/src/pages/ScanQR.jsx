import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

function ScanQR() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [qrDetected, setQrDetected] = useState(false)
  const [showVehicleSheet, setShowVehicleSheet] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')

  useEffect(() => {
    loadVehicles()
    
    // Simulate QR scanning - wait 1 seconds then detect
    const scanTimer = setTimeout(async () => {
      setScanning(false)
      setQrDetected(true)
      
      // Get location from database based on QR code
      const detectedLocation = await getLocationFromQR()
      setLocation(detectedLocation)
      
      // Show vehicle sheet after detection
      setTimeout(() => {
        setShowVehicleSheet(true)
      }, 500)
    }, 1000)

    return () => clearTimeout(scanTimer)
  }, [])

  const loadVehicles = async () => {
    try {
      // Try to get user from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fallback dummy data
      const dummyVehicles = [
        {
          id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          license_plate: 'MH 12 AB 1234',
          model: 'Toyota Camry',
          is_active: true
        },
        {
          id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          license_plate: 'MH 14 CD 5678',
          model: 'Honda Civic',
          is_active: true
        }
      ]

      if (user) {
        // Fetch vehicles from database
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading vehicles:', error)
          setVehicles(dummyVehicles)
        } else {
          setVehicles(data.length > 0 ? data : dummyVehicles)
        }
      } else {
        // No user, use dummy data
        setVehicles(dummyVehicles)
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
      // Fallback to dummy data on error
      setVehicles([
        {
          id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          license_plate: 'MH 12 AB 1234',
          model: 'Toyota Camry',
          is_active: true
        },
        {
          id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          license_plate: 'MH 14 CD 5678',
          model: 'Honda Civic',
          is_active: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getLocationFromQR = async () => {
    // In a real app, QR code would contain site_id
    // For prototype, we'll fetch a default site or use the Phoenix Mall UUID
    try {
      const siteId = '32112460-fb7a-4958-b871-8d78d74dd157' // Phoenix Mall from requirements
      
      const { data, error } = await supabase
        .from('sites')
        .select('name, address, city')
        .eq('id', siteId)
        .single()

      if (error) {
        // Fallback to default
        return 'Inorbit Mall'
      }

      return data?.name || 'Inorbit Mall'
    } catch (error) {
      return 'Inorbit Mall'
    }
  }

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-12 pb-4">
        <h1 className="text-white text-xl font-semibold">Scan QR Code</h1>
        <button
          onClick={() => navigate('/home')}
          className="w-8 h-8 flex items-center justify-center"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* QR Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {/* Viewfinder */}
        <div className="w-full max-w-sm border-2 border-purple-500 rounded-2xl aspect-square flex items-center justify-center bg-gray-800 bg-opacity-50 relative overflow-hidden">
          {scanning ? (
            <>
              {/* Scanning Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-purple-300 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="absolute bottom-8 text-white text-sm font-medium">Scanning QR Code...</p>
            </>
          ) : (
            <>
              {/* QR Code Icon */}
              <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm0 4h3v2h-3v-2zm-4-4h3v2h-3v-2zm0 4h3v2h-3v-2zm4-8h3v2h-3V7zm-4 0h3v2h-3V7z"/>
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Detection Status */}
        {qrDetected && (
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-white text-lg font-medium mb-2">QR Code Detected!</p>
            {location && (
              <p className="text-gray-400 text-base">{location}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {showVehicleSheet && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
          {/* Drag Handle */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>
          
          {/* Sheet Content */}
          <div className="px-5 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Select Your Vehicle</h2>
            <p className="text-sm text-gray-600 mb-5">
              Choose which vehicle you're parking at {location}
            </p>

            {/* Vehicle List */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No vehicles found</div>
            ) : (
              <div className="space-y-3 mb-5">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => {
                      setSelectedVehicle(vehicle.id)
                      navigate('/confirm-parking', { 
                        state: { 
                          vehicle, 
                          location 
                        } 
                      })
                    }}
                    className={`w-full bg-white border-2 rounded-xl p-4 flex items-center justify-between ${
                      selectedVehicle === vehicle.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-semibold text-gray-900">
                          {vehicle.model || 'Vehicle'}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {vehicle.license_plate}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xl">›</span>
                  </button>
                ))}
              </div>
            )}

            {/* Register New Vehicle Button */}
            <button 
              onClick={() => navigate('/vehicles')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
            >
              Register New Vehicle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScanQR

