import { useState, useEffect } from 'react'
import { Car } from 'lucide-react'
import { supabase } from '../lib/supabase'
import VehicleCard from '../components/VehicleCard'
import BottomNav from '../components/BottomNav'
import './Vehicles.css'

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    license_plate: '',
    model: ''
  })

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Use dummy data with provided UUIDs
      const dummyVehicles = [
        {
          id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          license_plate: 'MH 12 AB 1234',
          model: 'Toyota Camry',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          license_plate: 'MH 14 CD 5678',
          model: 'Honda Civic',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]

      // Try to fetch from database, fallback to dummy data
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading vehicles:', error)
        setVehicles(dummyVehicles)
      } else {
        setVehicles(data.length > 0 ? data : dummyVehicles)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingVehicle(null)
    setFormData({ license_plate: '', model: '' })
    setShowForm(true)
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      license_plate: vehicle.license_plate,
      model: vehicle.model || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Soft delete
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', vehicleId)
        .eq('user_id', user.id)

      if (error) throw error

      loadVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Failed to delete vehicle')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate license plate format (Indian format: XX XX XX XXXX)
    const plateRegex = /^[A-Z]{2}\s[0-9]{1,2}\s[A-Z]{1,2}\s[0-9]{4}$/
    if (!plateRegex.test(formData.license_plate.toUpperCase())) {
      alert('Invalid license plate format. Use format: XX XX XX XXXX (e.g., MH 12 AB 1234)')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            license_plate: formData.license_plate.toUpperCase(),
            model: formData.model
          })
          .eq('id', editingVehicle.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert({
            user_id: user.id,
            license_plate: formData.license_plate.toUpperCase(),
            model: formData.model,
            is_active: true
          })

        if (error) throw error
      }

      setShowForm(false)
      loadVehicles()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Failed to save vehicle')
    }
  }

  if (loading) {
    return (
      <div className="vehicles-container">
        <div className="loading">Loading...</div>
        <div className="bottom-nav-wrapper">
          <BottomNav />
        </div>
      </div>
    )
  }

  return (
    <div className="vehicles-container">
      <div className="vehicles-header">
        <h1>My Vehicles</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Vehicle
        </button>
      </div>

      {vehicles.filter(v => v.is_active).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Car className="w-16 h-16 text-gray-400" />
          </div>
          <p>No vehicles added yet</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="vehicles-list">
          {vehicles.filter(v => v.is_active).map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={() => handleEdit(vehicle)}
              onDelete={() => handleDelete(vehicle.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>License Plate *</label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  placeholder="MH 12 AB 1234"
                  required
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Toyota Camry"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bottom-nav-wrapper">
        <BottomNav />
      </div>
    </div>
  )
}

export default Vehicles

