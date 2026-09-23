import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Clock,
    ListTodo,
    DollarSign,
    BarChart3,
    LogOut,
    User,
    MapPin,
    Timer,
    UserPlus,
    Building2,
    Shield
} from 'lucide-react'

export default function AdminLayout() {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navItemClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            isActive
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
        }`

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-4 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col justify-between border-r border-slate-800 shadow-xl z-30">
                <div>
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 px-2 py-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-600/30">
                            WS
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight leading-none">WorkSphere</h2>
                            <span className="text-[11px] font-semibold text-indigo-400 capitalize flex items-center gap-1 mt-1">
                                <Shield className="w-3 h-3" />
                                {user?.role || "Admin"} Portal
                            </span>
                        </div>
                    </div>

                    <div className="px-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                            Navigation
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1">
                        <NavLink to="/admin" end className={navItemClass}>
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/employees" className={navItemClass}>
                            <Users size={18} />
                            <span>Employees</span>
                        </NavLink>
                        <NavLink to="/admin/attendance" className={navItemClass}>
                            <Clock size={18} />
                            <span>Attendance</span>
                        </NavLink>
                        <NavLink to="/admin/shifts" className={navItemClass}>
                            <Timer size={18} />
                            <span>Shift Timings</span>
                        </NavLink>
                        <NavLink to="/admin/geo-fence" className={navItemClass}>
                            <MapPin size={18} />
                            <span>Geo-Fence Settings</span>
                        </NavLink>
                        <NavLink to="/admin/leaves" className={navItemClass}>
                            <Calendar size={18} />
                            <span>Leaves</span>
                        </NavLink>
                        <NavLink to="/admin/tasks" className={navItemClass}>
                            <ListTodo size={18} />
                            <span>Tasks</span>
                        </NavLink>
                        <NavLink to="/admin/compensation" className={navItemClass}>
                            <DollarSign size={18} />
                            <span>Compensation</span>
                        </NavLink>
                        <NavLink to="/admin/analytics" className={navItemClass}>
                            <BarChart3 size={18} />
                            <span>Analytics</span>
                        </NavLink>
                    </nav>
                </div>

                {/* Bottom Sidebar Action */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    {user?.role === "Admin" && (
                        <NavLink
                            to="/admin/create-user"
                            className={({ isActive }) =>
                                `flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
                                    isActive
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30'
                                }`
                            }
                        >
                            <UserPlus size={16} />
                            <span>Add New User</span>
                        </NavLink>
                    )}

                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/50">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {user?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Admin"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email || "admin@worksphere.com"}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                {/* Navbar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">Workspace /</span>
                        <h2 className="text-sm font-bold text-slate-800 capitalize">
                            {location.pathname.replace('/admin/', '').replace('/admin', 'Dashboard').replace('-', ' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/profile')}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition border border-slate-200/80"
                        >
                            <User size={16} />
                            <span>My Profile</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200/80 transition"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}