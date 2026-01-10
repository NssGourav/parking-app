import './ParkingSessionCard.css'

function ParkingSessionCard({ session }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDuration = () => {
    if (session.end_time) {
      const start = new Date(session.start_time)
      const end = new Date(session.end_time)
      const diff = end - start
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    } else {
      const start = new Date(session.start_time)
      const now = new Date()
      const diff = now - start
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    }
  }

  return (
    <div className="session-card">
      <div className="session-header">
        <h3 className="session-site">{session.site_name}</h3>
        <span className={`session-status ${session.status}`}>
          {session.status}
        </span>
      </div>
      <div className="session-details">
        <div className="detail-row">
          <span className="detail-label">Vehicle:</span>
          <span className="detail-value">{session.vehicle_plate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Start Time:</span>
          <span className="detail-value">{formatDate(session.start_time)}</span>
        </div>
        {session.end_time && (
          <div className="detail-row">
            <span className="detail-label">End Time:</span>
            <span className="detail-value">{formatDate(session.end_time)}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Duration:</span>
          <span className="detail-value">{getDuration()}</span>
        </div>
      </div>
    </div>
  )
}

export default ParkingSessionCard

