import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function EmployeeLayout({ children }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-8">AstraaHR</h2>
        <hr class="border-t border-gray-300 my-4" />
        <nav className="space-y-4">
          <Link to="/employee" className="block hover:bg-indigo-700 p-2 rounded">Dashboard</Link>
          <Link to="/employee/my-attendance" className="block hover:bg-indigo-700 p-2 rounded">My Attendance</Link>
          <Link to="/employee/my-leaves" className="block hover:bg-indigo-700 p-2 rounded">My Leaves</Link>
          <Link to="/employee/my-salary" className="block hover:bg-indigo-700 p-2 rounded">My Salary</Link>
          <Link to="/employee/my-tasks" className="block hover:bg-indigo-700 p-2 rounded">My Tasks</Link>
          <Link to='/employee/notifications' className='block hover:bg-indigo-700 p-2 rounded'>Notifications</Link>
          <Link to='/employee/helpdesk' className='block hover:bg-indigo-700 p-2 rounded'>HelpDesk</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Navbar */}
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
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