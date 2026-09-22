import { memo } from 'react'
import { deleteNotification, markAsRead } from '../../services/NotificationService'
import { 
  Bell, 
  Calendar, 
  ListTodo, 
  IndianRupee, 
  Check, 
  Trash2, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'

function NotificationCard({ notification, onUpdate, onDelete }) {
  if (!notification) return null;

  const handleMarkAsRead = async () => {
    try {
      const res = await markAsRead(notification._id)
      onUpdate && onUpdate(res)
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await deleteNotification(notification._id)
      onDelete && onDelete(res)
    } catch (error) {
      console.error('Failed to delete notification', error)
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
    <div className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 group ${
      isUnread 
        ? 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-500/10' 
        : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
    }`}>
      
      {/* Left Icon + Content */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        
        {/* Type Icon Chip */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${style.bg}`}>
          {getTypeIcon(notification.type)}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">{notification.title || 'Notification'}</h4>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg}`}>
              {style.label}
            </span>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed break-words">{notification.message}</p>
          
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
            <Clock className="w-3 h-3" /> {formatDate(notification.createdAt)}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        {isUnread && (
          <button
            onClick={handleMarkAsRead}
            title="Mark as Read"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Check className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleDelete}
          title="Delete Notification"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}

export default memo(NotificationCard)
