import { useState } from 'react'

function LoginAs() {
  const [selectedRole, setSelectedRole] = useState('user')

  const roles = [
    { id: 'user', label: 'User', icon: '👤' },
    { id: 'manager', label: 'Manager', icon: '🛡️' },
    { id: 'driver', label: 'Driver', icon: '🚗' },
    { id: 'super_admin', label: 'Super Admin', icon: '👑' }
  ]

  return (
    <div className="w-full max-w-[430px] bg-white rounded-xl p-5 shadow-lg mt-8">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-center mb-3">
        Login As
      </div>
      <div className="flex justify-around gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
              selectedRole === role.id
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
          >
            <span className="text-2xl">{role.icon}</span>
            <span className="text-xs font-semibold">{role.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LoginAs
