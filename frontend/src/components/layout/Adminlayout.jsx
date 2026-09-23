import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { getMyNotifications, markAllAsRead, markAsRead } from '../../services/NotificationService'
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
    Shield,
    Bell,
    Search,
    ChevronDown,
    Plus,
    Menu,
    X,
    Home,
    ChevronRight,
    CheckCircle2,
    Sparkles,
    Check,
    ArrowRight
} from 'lucide-react'

export default function AdminLayout() {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const location = useLocation()

    // Navbar state
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [createMenuOpen, setCreateMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    // Notifications state
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const userMenuRef = useRef(null)
    const notifRef = useRef(null)
    const createMenuRef = useRef(null)
    const searchModalRef = useRef(null)

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const list = await getMyNotifications()
            if (Array.isArray(list)) {
                setNotifications(list.slice(0, 8))
                setUnreadCount(list.filter(n => !n.isRead).length)
            }
        } catch (err) {
            // Non-blocking notification fetch
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false)
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false)
            }
            if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
                setCreateMenuOpen(false)
            }
            if (searchModalRef.current && !searchModalRef.current.contains(e.target)) {
                setSearchOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(prev => !prev)
            } else if (e.key === 'Escape') {
                setSearchOpen(false)
                setUserMenuOpen(false)
                setNotifOpen(false)
                setCreateMenuOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileSidebarOpen(false)
    }, [location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Failed to mark all as read', err)
        }
    }

    const handleReadOne = async (id) => {
        try {
            await markAsRead(id)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error('Failed to mark as read', err)
        }
    }

    // Navigation items for search & sidebar
    const navModules = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, category: 'Overview' },
        { name: 'Employees Directory', path: '/admin/employees', icon: Users, category: 'Workforce' },
        { name: 'Attendance Ledger', path: '/admin/attendance', icon: Clock, category: 'Operations' },
        { name: 'Shift Timings & Rules', path: '/admin/shifts', icon: Timer, category: 'Operations' },
        { name: 'Geo-Fence & QR Kiosk', path: '/admin/geo-fence', icon: MapPin, category: 'Operations' },
        { name: 'Leave Management', path: '/admin/leaves', icon: Calendar, category: 'Workforce' },
        { name: 'Task Board & Kanban', path: '/admin/tasks', icon: ListTodo, category: 'Productivity' },
        { name: 'Compensation & Payroll', path: '/admin/compensation', icon: DollarSign, category: 'Finance' },
        { name: 'Workforce Analytics', path: '/admin/analytics', icon: BarChart3, category: 'Insights' },
        { name: 'Add New Employee', path: '/admin/create-user', icon: UserPlus, category: 'Actions' },
        { name: 'My Profile & Account', path: '/admin/profile', icon: User, category: 'Account' },
    ]

    const filteredModules = navModules.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Current page display title
    const getCurrentPageTitle = () => {
        const cleanPath = location.pathname.replace('/admin/', '').replace('/admin', '')
        if (!cleanPath) return 'Dashboard'
        const match = navModules.find(m => m.path === location.pathname)
        if (match) return match.name
        return cleanPath.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }

    const navItemClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            isActive
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
        }`

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`w-64 bg-slate-900 text-white p-4 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col justify-between border-r border-slate-800 shadow-xl z-50 transition-transform duration-200 lg:translate-x-0 ${
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand Header */}
                    <div className="flex items-center justify-between px-2 py-3 mb-4">
                        <div className="flex items-center gap-3">
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

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
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
            <main className="flex-1 lg:ml-64 min-h-screen flex flex-col min-w-0">
                {/* Modern Enterprise Admin Navbar */}
                <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
                    {/* Left: Mobile Toggle + Breadcrumb */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setMobileSidebarOpen(prev => !prev)}
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
                            title="Toggle menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Workspace</span>
                            </button>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px] sm:max-w-none">
                                {getCurrentPageTitle()}
                            </span>
                        </div>
                    </div>

                    {/* Center: Global Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-400 text-xs rounded-xl border border-slate-200/60 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-slate-400" />
                                <span>Quick jump to module...</span>
                            </div>
                            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-2xs">
                                ⌘K
                            </kbd>
                        </button>
                    </div>

                    {/* Right: Quick Actions, Notifications & Profile Menu */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        {/* Quick Create Dropdown */}
                        <div className="relative" ref={createMenuRef}>
                            <button
                                onClick={() => setCreateMenuOpen(prev => !prev)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Create</span>
                                <ChevronDown className="w-3 h-3 opacity-80" />
                            </button>

                            {createMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-1.5 border-b border-slate-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Actions</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCreateMenuOpen(false)
                                            navigate('/admin/create-user')
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Add New Employee</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCreateMenuOpen(false)
                                            navigate('/admin/tasks')
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
                                    >
                                        <ListTodo className="w-3.5 h-3.5 text-sky-500" />
                                        <span>Assign New Task</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCreateMenuOpen(false)
                                            navigate('/admin/compensation')
                                        }}
                                        className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors"
                                    >
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Create Salary Slip</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notifications Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(prev => !prev)}
                                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors"
                                title="Notifications"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-indigo-400" />
                                            <span className="text-xs font-bold">Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-[11px] text-indigo-300 hover:text-white font-medium hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-slate-400">
                                                No recent notifications
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif._id}
                                                    onClick={() => !notif.isRead && handleReadOne(notif._id)}
                                                    className={`p-3 text-xs transition-colors cursor-pointer ${
                                                        notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/50 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-semibold text-slate-800 leading-tight">
                                                            {notif.title || 'System Notification'}
                                                        </p>
                                                        {!notif.isRead && (
                                                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Pill & Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(prev => !prev)}
                                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                                    {user?.name?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">
                                        {user?.name || 'Admin'}
                                    </p>
                                    <span className="text-[10px] font-semibold text-indigo-600">
                                        {user?.role || 'Admin'}
                                    </span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@worksphere.com'}</p>
                                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                                            {user?.role || 'Admin'} Level Access
                                        </span>
                                    </div>

                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false)
                                                navigate('/admin/profile')
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors"
                                        >
                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                            <span>My Profile</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false)
                                                navigate('/admin/analytics')
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Analytics Center</span>
                                        </button>
                                    </div>

                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold transition-colors"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Global Command Palette / Quick Jump Modal */}
                {searchOpen && (
                    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-20 animate-in fade-in duration-150">
                        <div
                            ref={searchModalRef}
                            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Jump to any module, screen, or action..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                                />
                                <button
                                    onClick={() => setSearchOpen(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                                {filteredModules.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        No matching modules found for "{searchQuery}"
                                    </div>
                                ) : (
                                    filteredModules.map((item) => {
                                        const IconComp = item.icon
                                        return (
                                            <button
                                                key={item.path}
                                                onClick={() => {
                                                    setSearchOpen(false)
                                                    setSearchQuery('')
                                                    navigate(item.path)
                                                }}
                                                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-600 rounded-lg transition-colors">
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                            {item.name}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                            </button>
                                        )
                                    })
                                )}
                            </div>

                            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span>Navigate with click or arrow keys</span>
                                <span className="font-mono">ESC to close</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}