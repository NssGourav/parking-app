import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    vehicles: 0,
    activeSessions: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get vehicles count
      const { count: vehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Get active sessions count (dummy for now)
      const activeSessions = 0

      // Get transactions count
      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats({
        vehicles: vehiclesCount || 0,
        activeSessions: activeSessions,
        totalTransactions: transactionsCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
        <div className="bottom-nav-wrapper">
          <BottomNav />
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-value">{stats.vehicles}</div>
            <div className="stat-label">Vehicles</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeSessions}</div>
            <div className="stat-label">Active Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTransactions}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
      </div>

      <div className="bottom-nav-wrapper">
        <BottomNav />
      </div>
    </div>
  )
}

export default Dashboard

