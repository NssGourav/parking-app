import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Share2, Car, ArrowLeft } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import BottomNav from '../components/BottomNav'

function ParkingTicket() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if there's an active parking ticket
  useEffect(() => {
    const activeParking = localStorage.getItem('activeParking')
    const hasStateData = location.state?.vehicle && location.state?.location
    
    // If no active parking and no state data, redirect to home
    if (!activeParking && !hasStateData) {
      navigate('/home')
    }
  }, [navigate, location.state])

  // Get data from navigation state or localStorage
  const activeParking = localStorage.getItem('activeParking')
  let vehicleData, parkingLocation, amountPaid
  
  if (location.state?.vehicle && location.state?.location) {
    // Use state data if available (just created ticket)
    vehicleData = location.state.vehicle
    parkingLocation = location.state.location
    amountPaid = location.state.amount || 150
  } else if (activeParking) {
    // Use localStorage data (returning to ticket page)
    const parking = JSON.parse(activeParking)
    vehicleData = {
      model: parking.vehicleModel || 'Vehicle',
      license_plate: parking.vehicle
    }
    parkingLocation = parking.location
    amountPaid = parking.amount || 150
  } else {
    // Default fallback (shouldn't reach here due to redirect)
    vehicleData = {
      model: 'Toyota Camry',
      license_plate: 'MH 12 AB 1234'
    }
    parkingLocation = 'Inorbit Mall'
    amountPaid = 150
  }
  
  // Get or generate ticket ID from localStorage
  const getTicketId = () => {
    const ticketData = localStorage.getItem('ticketData')
    if (ticketData) {
      const data = JSON.parse(ticketData)
      return data.ticketId
    }
    // Generate new ticket ID
    const newTicketId = `TK-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`
    // Save it
    localStorage.setItem('ticketData', JSON.stringify({ ticketId: newTicketId }))
    return newTicketId
  }
  
  const ticketId = getTicketId()
  
  // Format entry time - use from active parking or current time
  const getEntryTime = () => {
    if (activeParking) {
      const parking = JSON.parse(activeParking)
      return parking.entryTime || new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
    return new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  
  const entryTime = getEntryTime()

  // Generate QR code data (in a real app, this would be a proper QR code)
  const qrData = JSON.stringify({
    ticketId,
    vehicle: vehicleData.license_plate,
    location: parkingLocation,
    entryTime: new Date().toISOString()
  })

  const handleDownload = () => {
    // In a real app, this would download the ticket as PDF/image
    console.log('Downloading ticket...')
  }

  const handleShare = () => {
    // In a real app, this would share the ticket
    if (navigator.share) {
      navigator.share({
        title: 'Parking Ticket',
        text: `My parking ticket for ${parkingLocation}`,
        url: window.location.href
      })
    } else {
      console.log('Sharing ticket...')
    }
  }

  return (
    <div className="w-full bg-white min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Digital Parking Ticket</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto pb-32">
        {/* Ticket Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center p-4">
              <QRCodeSVG
                value={qrData}
                size={240}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket ID:</span>
              <span className="text-gray-900">{ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="text-gray-900">{vehicleData.model}, {vehicleData.license_plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="text-gray-900">Malad West, Mumbai</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Entry Time:</span>
              <span className="text-gray-900">{entryTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-900">0m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="text-gray-900">₹{amountPaid}</span>
            </div>
          </div>

          {/* Powered by */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <span className="text-xs text-gray-500">Powered by Smart Parking</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-purple-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            onClick={() => {
              // Navigate to retrieval progress page
              navigate('/retrieval-progress', {
                state: {
                  vehicle: vehicleData,
                  location: parkingLocation,
                  entryTime: entryTime
                }
              })
            }}
          >
            <Car className="w-5 h-5" />
            <span>Get My Car</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" />
            <span>Download Ticket</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
            <span>Share Ticket</span>
          </motion.button>
        </div>

        {/* Hint Box */}
        <div className="bg-yellow-50 border border-gray-300 rounded-xl p-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-900">Keep this ticket handy</p>
            <p className="text-xs text-gray-600">Show this QR code when retrieving your vehicle</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-50">
        <BottomNav />
      </div>
    </div>
  )
}

export default ParkingTicket

