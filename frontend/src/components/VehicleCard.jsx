import './VehicleCard.css'

function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <div className="vehicle-card">
      <div className="vehicle-icon">🚗</div>
      <div className="vehicle-info">
        <div className="vehicle-plate">{vehicle.license_plate}</div>
        {vehicle.model && (
          <div className="vehicle-model">{vehicle.model}</div>
        )}
      </div>
      <div className="vehicle-actions">
        <button className="btn-icon" onClick={onEdit} title="Edit">
          ✏️
        </button>
        <button className="btn-icon" onClick={onDelete} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default VehicleCard

