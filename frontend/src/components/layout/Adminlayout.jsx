import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminLayout({ children }) {
  const {  logout } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-8">AstraaHR Admin</h2>
        <nav className="space-y-4">
          <Link to="/admin" className="block hover:bg-gray-700 p-2 rounded">Dashboard</Link>
          <Link to="/admin/employees" className="block hover:bg-gray-700 p-2 rounded">Employees</Link>
          <Link to="/admin/attendance" className="block hover:bg-gray-700 p-2 rounded">Attendance</Link>
          <Link to="/admin/leaves" className="block hover:bg-gray-700 p-2 rounded">Leaves</Link>
          <Link to="/admin/tasks" className="block hover:bg-gray-700 p-2 rounded">Tasks</Link>
          <Link to="/admin/compensation" className="block hover:bg-gray-700 p-2 rounded">Compensation</Link>
          <Link to="/admin/analytics" className="block hover:bg-gray-700 p-2 rounded">Analytics</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Navbar */}
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </nav>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}