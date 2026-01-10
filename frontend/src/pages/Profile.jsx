import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // Authentication removed - using dummy profile data
      const dummyProfile = {
        full_name: 'John Doe',
        phone: '+91 98765 43210',
        email: 'john.doe@example.com'
      }
      
      setProfile(dummyProfile)
      setFormData({
        full_name: dummyProfile.full_name,
        phone: dummyProfile.phone,
        email: dummyProfile.email
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    try {
      // Authentication removed - update local state only
      setProfile({
        ...profile,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email
      })
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleLogout = async () => {
    // Authentication removed - logout is a no-op
    console.log('Logout clicked (authentication disabled)')
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
        <div className="bottom-nav-wrapper">
          <BottomNav />
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        {!editing ? (
          <>
            <div className="profile-avatar">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Full Name:</span>
                <span className="info-value">{profile?.full_name || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{profile?.phone || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{profile?.email || 'N/A'}</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="profile-actions">
        <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="bottom-nav-wrapper">
        <BottomNav />
      </div>
    </div>
  )
}

export default Profile

