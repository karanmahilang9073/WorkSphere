import { memo } from 'react'
import { MapPin, QrCode, Clock, Zap, ArrowRight } from 'lucide-react'

function AttendanceCard({ attendance, onAnalyze }) {

  if (!attendance) return null;

  const getWorkHoursNumber = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    const diff = new Date(checkOut) - new Date(checkIn)
    if (diff <= 0) return 0
    return Math.min(Math.round((diff / (1000 * 60 * 60)) * 10) / 10, 24)
  }

  const formatHoursDisplay = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'In progress'
    const diff = new Date(checkOut) - new Date(checkIn)
    if (diff < 0) return 'Invalid'
    const hours = (diff / (1000 * 60 * 60)).toFixed(1)
    return `${hours} hrs`
  }

  const formatDateTime = (date, options = {}) => {
    if (!date) return options.type === 'time' ? '--:--' : 'Invalid Date'
    if (options.type === 'time') {
      return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    return new Date(date).toLocaleDateString('en-US', { day: "numeric", month: "short", year: "numeric" })
  }

  const hoursNum = attendance.workHours || getWorkHoursNumber(attendance.checkIn, attendance.checkOut)
  const progressPercent = Math.min(Math.round((hoursNum / 8) * 100), 100)

  const isPresent = attendance.status?.toLowerCase() === 'present'
  const isLeave = attendance.status?.toLowerCase() === 'leave'

  return (
    <div className='bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between'>
      
      <div>
        {/* Header: Date + Status Badges */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">{formatDateTime(attendance.date)}</h4>
            <span className="text-[11px] font-medium text-slate-400">{attendance.employee?.name || 'Staff Member'}</span>
          </div>

          <div className="flex gap-1 items-center">
            {attendance.late && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                Late
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
              isPresent 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' 
                : isLeave 
                ? 'bg-blue-50 text-blue-700 border border-blue-200/70' 
                : 'bg-rose-50 text-rose-700 border border-rose-200/70'
            }`}>
              {attendance.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Shift Badge & Punches */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-0.5">Check-In</span>
            <span className="text-xs font-bold text-slate-800">{formatDateTime(attendance.checkIn, { type: 'time' })}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-0.5">Check-Out</span>
            <span className="text-xs font-bold text-slate-800">{formatDateTime(attendance.checkOut, { type: 'time' })}</span>
          </div>
        </div>

        {/* Hours & Overtime Progress */}
        <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100 mb-2.5">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-500 font-medium">Work Hours</span>
            <span className="font-bold text-indigo-600">{formatHoursDisplay(attendance.checkIn, attendance.checkOut)}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {attendance.overtimeHours > 0 && (
            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/60 text-[10px]">
              <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-amber-500" /> OT
              </span>
              <span className="font-bold text-amber-800">+{attendance.overtimeHours} hrs</span>
            </div>
          )}
        </div>

        {/* Verification Method Pill */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
            {attendance.shiftType || 'General'} Shift
          </span>
          {attendance.checkIn && (
            attendance.checkInMethod === 'qr' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <QrCode className="w-3 h-3 text-emerald-600" /> QR
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-cyan-700 font-medium">
                <MapPin className="w-3 h-3 text-cyan-600" /> Geo
              </span>
            )
          )}
        </div>
      </div>

      {onAnalyze && (
        <button
          onClick={() => onAnalyze(attendance.employee?._id)}
          disabled={!attendance.employee}
          className='w-full mt-1 bg-slate-800 hover:bg-indigo-600 text-white text-[11px] font-semibold py-1.5 px-2 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-1'>
          Analyze AI <ArrowRight className="w-3 h-3" />
        </button>
      )}

    </div>
  )
}

export default memo(AttendanceCard)