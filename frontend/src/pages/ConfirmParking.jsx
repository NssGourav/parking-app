import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Phone, Building2, CreditCard, Wallet, MapPin, Car, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import BottomNav from '../components/BottomNav'

function ConfirmParking() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedPayment, setSelectedPayment] = useState('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const vehicleData = location.state?.vehicle || {
    model: 'Honda Civic',
    license_plate: 'MH 14 CD 5678'
  }
  const parkingLocation = location.state?.location || 'Inorbit Mall'

  const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: Phone },
    { id: 'netbanking', label: 'Netbanking', icon: Building2 },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'cash', label: 'Cash', icon: Wallet }
  ]

  return (
    <div className="w-full bg-white min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-900 text-white px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Confirm Parking</h1>
        </div>
      </div>

      {/* Auto-filled Banner */}
      <div className="bg-green-50 border-l-4 border-green-500 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-green-800 font-medium">Auto-filled from saved vehicle</span>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto pb-24">
        {/* Parking Location Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-base text-gray-900">Parking Location</h2>
          </div>
          <div className="space-y-1 text-sm">
            <div className="text-gray-900">{parkingLocation}</div>
            <div className="text-gray-600">Malad West, Mumbai</div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Payment Method</h2>
          <p className="text-sm text-gray-600 mb-4">Choose how you want to pay</p>
          
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = selectedPayment === method.id
              return (
                <motion.button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`relative border-2 rounded-xl p-4 flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-purple-500' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-sm ${
                    isSelected ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {method.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-1"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Rate:</span>
              <span className="text-gray-900">₹100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee:</span>
              <span className="text-gray-900">₹30</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (18%):</span>
              <span className="text-gray-900">₹20</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-base text-gray-900">Total Amount:</span>
                <span className="text-base text-gray-900">₹150</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Park My Car Button - Sticky at bottom of container */}
      <div className="sticky bottom-16 bg-white border-t border-gray-200 px-5 py-4 z-10 mt-auto">
        <motion.button
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          onClick={() => {
            if (isProcessing) return
            
            setIsProcessing(true)
            
            // Simulate payment processing
            setTimeout(() => {
              // Generate ticket ID
              const ticketId = `TK-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`
              
              // Save ticket data to localStorage
              localStorage.setItem('ticketData', JSON.stringify({ ticketId }))
              
              // Save active parking to localStorage
              const activeParkingData = {
                location: parkingLocation,
                vehicle: vehicleData.license_plate,
                vehicleModel: vehicleData.model,
                amount: 150,
                entryTime: new Date().toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }),
                startTime: new Date().toISOString(),
                duration: '0m'
              }
              localStorage.setItem('activeParking', JSON.stringify(activeParkingData))
              
              // Navigate to parking ticket page with vehicle and location data
              navigate('/parking-ticket', {
                state: {
                  vehicle: vehicleData,
                  location: parkingLocation,
                  amount: 150
                }
              })
            }, 2000) // 2 second delay to show processing
          }}
          disabled={isProcessing}
          className={`w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg ${
            isProcessing 
              ? 'bg-purple-600 text-white cursor-wait' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Car className="w-5 h-5" />
              <span>Park My Car</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-50 mt-auto">
        <BottomNav />
      </div>
    </div>
  )
}

export default ConfirmParking

