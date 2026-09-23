import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, NavLink, Outlet, Link } from 'react-router-dom'
import {LayoutDashboard, Users, Calendar, Clock, ListTodo, DollarSign, BarChart3, LogOut, User, MapPin} from 'lucide-react'

export default function AdminLayout() {
  const { user,  logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-3 h-screen fixed left-0 top-0 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">
          WorkSphere, {user?.role}
        </h2>
        <hr className="border-t border-gray-300 my-4" />
        <nav className="space-y-4">
          <NavLink to="/admin" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}>< LayoutDashboard size={20}/>Dashboard</NavLink>
          <NavLink to="/admin/employees" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><Users size={20}/>Employees</NavLink>
          <NavLink to="/admin/attendance" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><Clock size={20}/>Attendance</NavLink>
          <NavLink to="/admin/geo-fence" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><MapPin size={20}/>Geo-Fence Settings</NavLink>
          <NavLink to="/admin/leaves" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><Calendar/>Leaves</NavLink>
          <NavLink to="/admin/tasks" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><ListTodo/>Tasks</NavLink>
          <NavLink to="/admin/compensation" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><DollarSign/>Compensation</NavLink>
          <NavLink to="/admin/analytics" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'} flex gap-2`}><BarChart3/>Analytics</NavLink>
          {user?.role === "Admin" && (
              <Link to="/admin/create-user" className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700">
                Create User
              </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Navbar */}
        <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-semibold">
            {user?.role} panel
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/profile')} className='flex items-center gap-2 text-gray-700 hover:text-blue-600 p-2 rounded hover:bg-gray-100'>
              <User size={20}/>
              <span>Profile</span>
            </button>
            <button onClick={handleLogout} className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition'>
              <LogOut size={20}/>
              <span>Logout</span>
            </button>
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