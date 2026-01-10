import './TransactionCard.css'

function TransactionCard({ transaction }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      upi: 'UPI',
      netbanking: 'Net Banking',
      card: 'Card',
      cash: 'Cash'
    }
    return labels[method] || method
  }

  return (
    <div className="transaction-card">
      <div className="transaction-header">
        <div>
          <h3 className="transaction-site">{transaction.site_name || 'Unknown Site'}</h3>
          <p className="transaction-vehicle">{transaction.vehicle_plate || 'Unknown Vehicle'}</p>
        </div>
        <div className="transaction-amount">₹{transaction.amount?.toFixed(2) || '0.00'}</div>
      </div>
      <div className="transaction-details">
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{formatDate(transaction.created_at)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Payment Method:</span>
          <span className="detail-value">{getPaymentMethodLabel(transaction.payment_method)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Breakdown:</span>
          <span className="detail-value">
            ₹{transaction.base_rate?.toFixed(2) || '0.00'} + 
            ₹{transaction.service_fee?.toFixed(2) || '0.00'} + 
            ₹{transaction.gst?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
      <div className="transaction-status-badge">
        <span className={`status ${transaction.status}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  )
}

export default TransactionCard

