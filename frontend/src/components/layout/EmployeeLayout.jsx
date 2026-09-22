import { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Clock,
  Calendar,
  IndianRupee,
  ListTodo,
  User,
  LogOut,
  HeadphonesIcon,
  Bell,
  Sparkles,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'

export default function EmployeeLayout() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: "/employee", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/employee/my-attendance", label: "My Attendance", icon: Clock },
    { to: "/employee/my-leaves", label: "My Leaves", icon: Calendar },
    { to: "/employee/my-salary", label: "My Salary", icon: IndianRupee },
    { to: "/employee/my-tasks", label: "My Tasks", icon: ListTodo },
    { to: "/employee/notifications", label: "Notifications", icon: Bell },
    { to: "/employee/helpdesk", label: "HelpDesk", icon: HeadphonesIcon },
  ]

  // Get current page name
  const getCurrentPageTitle = () => {
    const active = navItems.find(item => 
      item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to) && item.to !== "/employee"
    )
    return active ? active.label : "Dashboard"
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div>
          {/* Brand Logo Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white leading-none">WorkSphere</h2>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 block">Employee Suite</span>
              </div>
            </div>

            <button 
              onClick={() => setMobileOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3.5 py-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Workspace Menu
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/25' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'}
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom User Mini Profile */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Employee'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.department || 'Staff'}</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 flex justify-between items-center shadow-2xs">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-medium text-slate-500 hidden sm:inline">Workspace</span>
              <ChevronRight className="w-3 h-3 hidden sm:inline" />
              <span className="font-bold text-slate-900">{getCurrentPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Notification Shortcut */}
            <button 
              onClick={() => navigate('/employee/notifications')}
              className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
            </button>

            {/* Profile Button */}
            <button 
              onClick={() => navigate('/employee/profile')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-semibold transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-10">
          <Outlet />
        </main>
      </div>

    </div>
  )
}