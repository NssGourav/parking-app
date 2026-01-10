import BottomNav from '../components/BottomNav'

function History() {
  const transactions = [
    {
      id: '1',
      site_name: 'Phoenix Mall',
      vehicle: 'MH 12 AB 1234',
      amount: 180,
      date: '8 Dec 2025',
      payment_method: 'upi',
      status: 'completed',
      base_rate: 150,
      service_fee: 20,
      gst: 10
    },
    {
      id: '2',
      site_name: 'Central Plaza',
      vehicle: 'MH 14 CD 5678',
      amount: 120,
      date: '5 Dec 2025',
      payment_method: 'card',
      status: 'completed',
      base_rate: 100,
      service_fee: 15,
      gst: 5
    },
    {
      id: '3',
      site_name: 'City Center Mall',
      vehicle: 'MH 12 AB 1234',
      amount: 200,
      date: '3 Dec 2025',
      payment_method: 'upi',
      status: 'completed',
      base_rate: 170,
      service_fee: 20,
      gst: 10
    }
  ]

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
    <div className="w-full bg-gray-100 min-h-full flex flex-col">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">History</h1>
      </div>

      <div className="px-5 flex-1 pb-20">
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{tx.site_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tx.vehicle}</p>
                </div>
                <div className="text-lg font-bold text-gray-800">₹{tx.amount}</div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Date: {tx.date}</span>
                <span>Payment: {getPaymentMethodLabel(tx.payment_method)}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                ₹{tx.base_rate} + ₹{tx.service_fee} + ₹{tx.gst}
              </div>
              <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                {tx.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <BottomNav />
      </div>
    </div>
  )
}

export default History

