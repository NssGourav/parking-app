import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Ticket, History, Settings } from 'lucide-react'

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  // Check if there's an active parking ticket
  const activeParking = localStorage.getItem('activeParking')
  const hasActiveTicket = !!activeParking

  const handleTicketClick = () => {
    if (hasActiveTicket) {
      // Navigate to parking ticket page if there's an active ticket
      navigate('/parking-ticket')
    }
    // If no active ticket, do nothing (button is disabled)
  }

  const navItems = [
    { path: '/home', label: 'Home', icon: Home, onClick: null },
    { 
      path: hasActiveTicket ? '/parking-ticket' : null, 
      label: 'Ticket', 
      icon: Ticket, 
      onClick: handleTicketClick,
      disabled: !hasActiveTicket
    },
    { path: '/history', label: 'History', icon: History, onClick: null },
    { path: '/settings', label: 'Settings', icon: Settings, onClick: null }
  ]

  return (
    <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 rounded-t-3xl shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => {
          let isActive = false
          if (item.label === 'Ticket') {
            // For Ticket, check if we're on parking-ticket or sessions page
            isActive = location.pathname === '/parking-ticket' || location.pathname === '/sessions'
          } else {
            isActive = location.pathname === item.path
          }
          
          const Icon = item.icon
          const isDisabled = item.disabled || false
          return (
            <button
              key={item.path || item.label}
              onClick={item.onClick || (() => !isDisabled && navigate(item.path))}
              disabled={isDisabled}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${
                isDisabled 
                  ? 'text-gray-300 cursor-not-allowed opacity-50' 
                  : isActive 
                    ? 'text-indigo-500' 
                    : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive && !isDisabled ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium ${isActive && !isDisabled ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav
