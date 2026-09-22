import React, { useState, useEffect } from 'react'
import { getMyNotifications } from '../../services/NotificationService'
import NotificationCard from '../../components/notification/NotificationCard'
import { toast } from 'react-toastify'
import { 
  Bell, 
  RefreshCw, 
  CheckCheck, 
  Inbox, 
  Calendar, 
  ListTodo, 
  IndianRupee,
  Sparkles
} from 'lucide-react'

function Notification() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const res = await getMyNotifications()
            setNotifications(res || [])
        } catch (error) {
            console.error('error while loading notifications', error)
            toast.error('Failed to fetch notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleUpdate = (updatedNotification) => {
        setNotifications(prev => prev.map(n => n._id === updatedNotification._id ? updatedNotification : n))
    }

    const handleDelete = (deleteId) => {
        setNotifications(prev => prev.filter(n => n._id !== deleteId))
        toast.success('Notification removed')
    }

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead
        if (filter === 'task') return n.type === 'task'
        if (filter === 'leave') return n.type === 'leave'
        if (filter === 'salary') return n.type === 'salary'
        return true
    })

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className='p-4 md:p-6 space-y-4 max-w-7xl mx-auto'>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                Notification Center
                            </h1>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            Real-time alerts for tasks, leaves, payroll & announcements
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchNotifications}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                    { id: 'all', label: 'All Notifications', count: notifications.length },
                    { id: 'unread', label: 'Unread', count: unreadCount },
                    { id: 'task', label: 'Tasks', count: notifications.filter(n => n.type === 'task').length },
                    { id: 'leave', label: 'Leaves', count: notifications.filter(n => n.type === 'leave').length },
                    { id: 'salary', label: 'Payroll', count: notifications.filter(n => n.type === 'salary').length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                            filter === tab.id
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                        }`}>
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-16 flex flex-col justify-center items-center text-slate-500 gap-2 bg-white rounded-2xl border border-slate-200/90">
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="text-xs font-medium">Fetching notifications...</span>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No Notifications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up with your workspace alerts.</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filteredNotifications.map((n) => (
                        <NotificationCard
                            key={n._id}
                            notification={n}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

        </div>
    )
}

export default Notification
