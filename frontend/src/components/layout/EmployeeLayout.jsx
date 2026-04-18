import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { Link, useNavigate, NavLink, Outlet } from 'react-router-dom'
import {LayoutDashboard, Clock, Calendar, DollarSign, ListTodo, User, LogOut, HeadphonesIcon, Bell} from 'lucide-react'

export default function EmployeeLayout() {
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
          <NavLink to="/employee" className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><LayoutDashboard size={20}/>Dashboard</NavLink>
          <NavLink to="/employee/my-attendance" className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><Clock size={20}/>My Attendance</NavLink>
          <NavLink to="/employee/my-leaves" className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><Calendar size={20}/>My Leaves</NavLink>
          <NavLink to="/employee/my-salary" className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><DollarSign size={20}/>My Salary</NavLink>
          <NavLink to="/employee/my-tasks" className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><ListTodo size={20}/>My Tasks</NavLink>
          <NavLink to='/employee/notifications' className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><Bell size={20}/>Notifications</NavLink>
          <NavLink to='/employee/helpdesk' className={({isActive}) => `p-2 rounded flex items-center gap-2 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}><HeadphonesIcon size={20}/>HelpDesk</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Navbar */}
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/employee/profile')} className='flex items-center gap-2 text-gray-700 hover:text-indigo-600 p-2 rounded hover:bg-gray-100'><User size={20}/>Profile</button>
            <button onClick={handleLogout} className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition'><LogOut size={20}/>Logout</button>
          </div>
        </nav>
        
        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}