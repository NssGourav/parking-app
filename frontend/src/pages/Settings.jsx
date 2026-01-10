import BottomNav from '../components/BottomNav'

function Settings() {
  const profile = {
    full_name: 'John Doe',
    phone: '+91 98765 43210',
    email: 'john.doe@example.com'
  }

  return (
    <div className="w-full bg-gray-100 min-h-full flex flex-col">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="px-5 flex-1 pb-20">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6">
            {profile.full_name[0]}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Full Name</span>
              <span className="text-sm font-semibold text-gray-800">{profile.full_name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Phone</span>
              <span className="text-sm font-semibold text-gray-800">{profile.phone}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-600">Email</span>
              <span className="text-sm font-semibold text-gray-800">{profile.email}</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl mt-4">
          Edit Profile
        </button>
        <button className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl mt-3">
          Logout
        </button>
      </div>

      <div className="mt-auto">
        <BottomNav />
      </div>
    </div>
  )
}

export default Settings

