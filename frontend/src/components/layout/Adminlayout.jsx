import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, NavLink } from 'react-router-dom'

export default function AdminLayout({ children }) {
  const {  logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-8">AstraaHR Admin</h2>
        <hr className="border-t border-gray-300 my-4" />
        <nav className="space-y-4">
          <NavLink to="/admin" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Dashboard</NavLink>
          <NavLink to="/admin/employees" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Employees</NavLink>
          <NavLink to="/admin/attendance" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Attendance</NavLink>
          <NavLink to="/admin/leaves" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Leaves</NavLink>
          <NavLink to="/admin/tasks" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Tasks</NavLink>
          <NavLink to="/admin/compensation" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Compensation</NavLink>
          <NavLink to="/admin/analytics" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Analytics</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Navbar */}
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </nav>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}