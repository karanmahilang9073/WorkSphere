import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate, NavLink } from 'react-router-dom'

export default function EmployeeLayout({ children }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-8">AstraaHR</h2>
        <hr className="border-t border-gray-300 my-4" />
        <nav className="space-y-4">
          <NavLink to="/employee" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>Dashboard</NavLink>
          <NavLink to="/employee/my-attendance" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>My Attendance</NavLink>
          <NavLink to="/employee/my-leaves" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>My Leaves</NavLink>
          <NavLink to="/employee/my-salary" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>My Salary</NavLink>
          <NavLink to="/employee/my-tasks" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>My Tasks</NavLink>
          <NavLink to='/employee/notifications' className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>Notifications</NavLink>
          <NavLink to='/employee/helpdesk' className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>HelpDesk</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Navbar */}
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
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