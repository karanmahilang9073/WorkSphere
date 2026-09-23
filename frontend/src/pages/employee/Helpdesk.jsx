import React from 'react'
import ChatBox from '../../components/ai/ChatBox'
import { LifeBuoy, Sparkles, ShieldCheck } from 'lucide-react'

function Helpdesk() {
  return (
    <div className='p-4 md:p-6 space-y-4 max-w-6xl mx-auto'>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border border-indigo-100/60">
            <LifeBuoy className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                WorkSphere Helpdesk
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Assistant Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant answers for attendance, leaves, payroll policies & workplace queries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">Confidential & Verified</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className='bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-230px)] min-h-[540px]'>
        <ChatBox />
      </div>
    </div>
  )
}

export default Helpdesk
