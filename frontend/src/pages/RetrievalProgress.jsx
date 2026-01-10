import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Car, Send, Phone, Clock, MapPin, Sparkles } from 'lucide-react'
import BottomNav from '../components/BottomNav'

function RetrievalProgress() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1) // 1: Request Received, 2: Car on Way, 3: Car Arriving

  // Get data from navigation state or use defaults
  const vehicleData = location.state?.vehicle || {
    model: 'Toyota Camry',
    license_plate: 'MH 12 AB 1234'
  }
  const parkingLocation = location.state?.location || 'Inorbit Mall'
  const entryTime = location.state?.entryTime || '10:01 pm'

  // Simulate progress updates
  useEffect(() => {
    // Move to step 2 after 3 seconds
    const timer1 = setTimeout(() => {
      setCurrentStep(2)
    }, 3000)

    // Move to step 3 after 8 seconds
    const timer2 = setTimeout(() => {
      setCurrentStep(3)
    }, 8000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const steps = [
    {
      id: 1,
      title: 'Request Received',
      description: 'Valet has been notified',
      icon: Check,
      completed: currentStep >= 1,
      active: currentStep === 1
    },
    {
      id: 2,
      title: 'Car on the Way',
      description: 'Vehicle is being brought',
      icon: Car,
      completed: currentStep >= 2,
      active: currentStep === 2
    },
    {
      id: 3,
      title: 'Car Arriving',
      description: 'Ready for pickup',
      icon: Send,
      completed: currentStep >= 3,
      active: currentStep === 3
    }
  ]

  return (
    <div className="w-full bg-gray-100 min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl text-gray-900">Parking Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto pb-32">
        {/* Status Card - Dynamic based on current step */}
        {currentStep === 1 && (
          <div className="bg-blue-600 text-white rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">Request Received</h2>
                <p className="text-sm text-blue-100">Our valet has been notified</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-500">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm">Estimated time: 5-7 minutes</span>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-orange-500 text-white rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">Car on the Way</h2>
                <p className="text-sm text-orange-100">Your vehicle is being brought to the pickup point</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-400">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm">Arriving in ~3 minutes</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-green-600 text-white rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">Car Arriving</h2>
                <p className="text-sm text-green-100">Ready for pickup</p>
              </div>
            </div>
          </div>
        )}

        {/* Retrieval Progress */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Retrieval Progress</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = step.completed
              const isActive = step.active
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex items-start gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500' 
                        : isActive 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isCompleted || isActive ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={`text-sm ${
                      isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Parking Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Parking Details</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-gray-600">Vehicle: </span>
                <span className="text-gray-900">{vehicleData.model}</span>
                <span className="text-gray-900 ml-2">{vehicleData.license_plate}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-gray-600">Location: </span>
                <span className="text-gray-900">{parkingLocation}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-gray-600">Entry Time: </span>
                <span className="text-gray-900">{entryTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
            onClick={() => {
              // Call support functionality
              window.location.href = 'tel:+919876543210'
            }}
          >
            <Phone className="w-5 h-5" />
            <span>Call Support</span>
          </motion.button>

          {currentStep >= 3 && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Your vehicle is ready at the pickup point!</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                onClick={() => {
                  // Clear active parking and ticket data from localStorage
                  localStorage.removeItem('activeParking')
                  localStorage.removeItem('ticketData')
                  // Complete parking and exit
                  navigate('/home')
                }}
              >
                <Check className="w-5 h-5" />
                <span>Complete & Exit Parking</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-50">
        <BottomNav />
      </div>
    </div>
  )
}

export default RetrievalProgress

