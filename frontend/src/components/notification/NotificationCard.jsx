import { memo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteNotification, markAsRead } from '../../services/NotificationService'
import { AuthContext } from '../../context/AuthContext'
import { 
  Bell, 
  Calendar, 
  ListTodo, 
  IndianRupee, 
  Check, 
  Trash2, 
  Clock, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

function NotificationCard({ notification, onUpdate, onDelete }) {
  if (!notification) return null;

  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const handleMarkAsRead = async () => {
    if (notification.isRead) return
    // Optimistic update
    onUpdate && onUpdate({ ...notification, isRead: true })
    try {
      const res = await markAsRead(notification._id)
      if (res?.notification) {
        onUpdate && onUpdate(res.notification)
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error)
      // Rollback on failure
      onUpdate && onUpdate({ ...notification, isRead: false })
    }
  }

  const handleDelete = async () => {
    // Optimistic delete
    onDelete && onDelete(notification._id)
    try {
      await deleteNotification(notification._id)
    } catch (error) {
      console.error('Failed to delete notification', error)
    }
  }

  const handleCardClick = () => {
    // Mark as read in background if not read yet
    if (!notification.isRead) {
      handleMarkAsRead()
    }

    const isAdmin = ['Admin', 'HR'].includes(user?.role)
    const type = notification.type?.toLowerCase()

    if (type === 'task') {
      navigate(isAdmin ? '/admin/tasks' : '/employee/my-tasks')
    } else if (type === 'leave') {
      navigate(isAdmin ? '/admin/leaves' : '/employee/my-leaves')
    } else if (type === 'salary') {
      navigate(isAdmin ? '/admin/compensation' : '/employee/my-salary')
    } else if (type === 'attendance') {
      navigate(isAdmin ? '/admin/attendance' : '/employee/my-attendance')
    } else {
      navigate(isAdmin ? '/admin' : '/employee')
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'task':
        return <ListTodo className="w-4 h-4 text-purple-600" />
      case 'salary':
        return <IndianRupee className="w-4 h-4 text-emerald-600" />
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />
    }
  }

  const getTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'leave':
        return { bg: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Leave' }
      case 'task':
        return { bg: 'bg-purple-50 border-purple-200 text-purple-700', label: 'Task' }
      case 'salary':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Payroll' }
      default:
        return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: 'General' }
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const style = getTypeStyle(notification.type)
  const isUnread = !notification.isRead

  return (
    <div 
      onClick={handleCardClick}
      className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 group cursor-pointer hover:shadow-xs hover:border-indigo-300 ${
        isUnread 
          ? 'bg-white border-indigo-200 shadow-2xs ring-1 ring-indigo-500/10' 
          : 'bg-white/80 border-slate-200/80 hover:bg-white'
      }`}
    >
      
      {/* Left Icon + Content */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        
        {/* Type Icon Chip */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${style.bg} group-hover:scale-105 transition-transform`}>
          {getTypeIcon(notification.type)}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
              {notification.title || 'Notification'}
            </h4>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg}`}>
              {style.label}
            </span>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed break-words">{notification.message}</p>
          
          <div className="flex items-center gap-3 pt-0.5">
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(notification.createdAt)}
            </p>
            <span className="text-[11px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              <span>View details</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        {isUnread && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMarkAsRead()
            }}
            title="Mark as Read"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          title="Delete Notification"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}

export default memo(NotificationCard)
