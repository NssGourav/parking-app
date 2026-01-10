import { useLocation } from 'react-router-dom'
import LoginAs from './LoginAs'

function MobileFrame({ children }) {
  const location = useLocation()
  const showLoginAs = location.pathname !== '/login' && 
                      location.pathname !== '/register' && 
                      location.pathname !== '/scan-qr' &&
                      location.pathname !== '/confirm-parking' &&
                      location.pathname !== '/parking-ticket' &&
                      location.pathname !== '/retrieval-progress'
  const isScanPage = location.pathname === '/scan-qr'
  const isConfirmPage = location.pathname === '/confirm-parking' || location.pathname === '/parking-ticket' || location.pathname === '/retrieval-progress'

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-start py-5 px-5">
      <div className={`w-full max-w-[390px] border-[3px] border-black rounded-3xl overflow-hidden bg-black p-1 shadow-2xl ${
        isScanPage || isConfirmPage ? 'h-[calc(100vh-40px)]' : 'h-[calc(100vh-100px)] max-h-[900px]'
      } flex flex-col mx-auto`}>
        <div className={`w-full h-full ${
          isScanPage ? 'bg-gray-900' : isConfirmPage ? 'bg-white' : 'bg-gray-100'
        } rounded-[20px] overflow-hidden relative flex flex-col ${isScanPage ? '' : 'overflow-y-auto'}`}>
          {children}
        </div>
      </div>
      {showLoginAs && <LoginAs />}
    </div>
  )
}

export default MobileFrame
