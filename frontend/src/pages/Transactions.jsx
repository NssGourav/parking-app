import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TransactionCard from '../components/TransactionCard'
import BottomNav from '../components/BottomNav'
import './Transactions.css'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicle_id: '',
    site_id: '',
    base_rate: '',
    service_fee: '',
    gst: '',
    payment_method: 'upi',
    status: 'pending'
  })

  useEffect(() => {
    loadTransactions()
    loadVehicles()
    loadSites()
  }, [])

  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Dummy data
      const dummyTransactions = [
        {
          id: '1',
          user_id: user.id,
          vehicle_id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          site_id: '32112460-fb7a-4958-b871-8d78d74dd157',
          site_name: 'Phoenix Mall',
          vehicle_plate: 'MH 12 AB 1234',
          amount: 180,
          base_rate: 150,
          service_fee: 20,
          gst: 10,
          payment_method: 'upi',
          status: 'completed',
          created_at: new Date('2025-12-08').toISOString()
        },
        {
          id: '2',
          user_id: user.id,
          vehicle_id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          site_id: '32112460-fb7a-4958-b871-8d78d74dd157',
          site_name: 'Central Plaza',
          vehicle_plate: 'MH 14 CD 5678',
          amount: 120,
          base_rate: 100,
          service_fee: 15,
          gst: 5,
          payment_method: 'card',
          status: 'completed',
          created_at: new Date('2025-12-05').toISOString()
        }
      ]

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setTransactions(dummyTransactions)
      } else {
        // Enrich with site and vehicle names
        const enriched = await Promise.all(
          (data.length > 0 ? data : dummyTransactions).map(async (tx) => {
            const site = sites.find(s => s.id === tx.site_id) || { name: tx.site_name || 'Unknown Site' }
            const vehicle = vehicles.find(v => v.id === tx.vehicle_id) || { license_plate: tx.vehicle_plate || 'Unknown' }
            return {
              ...tx,
              site_name: site.name,
              vehicle_plate: vehicle.license_plate
            }
          })
        )
        setTransactions(enriched)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dummyVehicles = [
        {
          id: 'a47c5498-7344-4e79-babb-75e4f5f01096',
          license_plate: 'MH 12 AB 1234',
          model: 'Toyota Camry'
        },
        {
          id: '6cbaeed9-5f6e-49ed-99b2-70b58a0f0dd9',
          license_plate: 'MH 14 CD 5678',
          model: 'Honda Civic'
        }
      ]

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        setVehicles(dummyVehicles)
      } else {
        setVehicles(data.length > 0 ? data : dummyVehicles)
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
    }
  }

  const loadSites = async () => {
    try {
      const dummySites = [
        {
          id: '32112460-fb7a-4958-b871-8d78d74dd157',
          name: 'Phoenix Mall',
          address: 'Lower Parel, Mumbai'
        }
      ]

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true)

      if (error) {
        setSites(dummySites)
      } else {
        setSites(data.length > 0 ? data : dummySites)
      }
    } catch (error) {
      console.error('Error loading sites:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const baseRate = parseFloat(formData.base_rate)
    const serviceFee = parseFloat(formData.service_fee) || 0
    const gst = parseFloat(formData.gst) || 0
    const amount = baseRate + serviceFee + gst

    // Validate payment method
    const validMethods = ['upi', 'netbanking', 'card', 'cash']
    if (!validMethods.includes(formData.payment_method)) {
      alert('Invalid payment method')
      return
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed']
    if (!validStatuses.includes(formData.status)) {
      alert('Invalid transaction status')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          vehicle_id: formData.vehicle_id,
          site_id: formData.site_id,
          amount: amount,
          base_rate: baseRate,
          service_fee: serviceFee,
          gst: gst,
          payment_method: formData.payment_method,
          status: formData.status
        })

      if (error) throw error

      setShowForm(false)
      setFormData({
        vehicle_id: '',
        site_id: '',
        base_rate: '',
        service_fee: '',
        gst: '',
        payment_method: 'upi',
        status: 'pending'
      })
      loadTransactions()
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('Failed to create transaction')
    }
  }

  if (loading) {
    return (
      <div className="transactions-container">
        <div className="loading">Loading...</div>
        <div className="bottom-nav-wrapper">
          <BottomNav />
        </div>
      </div>
    )
  }

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle *</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate} {vehicle.model ? `- ${vehicle.model}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Site *</label>
                <select
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                  required
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Base Rate (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_rate}
                  onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Service Fee (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.service_fee}
                  onChange={(e) => setFormData({ ...formData, service_fee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>GST (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  required
                >
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Amount (₹)</label>
                <input
                  type="text"
                  value={(
                    (parseFloat(formData.base_rate) || 0) +
                    (parseFloat(formData.service_fee) || 0) +
                    (parseFloat(formData.gst) || 0)
                  ).toFixed(2)}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Transaction
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

export default Transactions

