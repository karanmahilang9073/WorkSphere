import { useContext, useEffect, useState } from "react";
import { 
  ListTodo, 
  Clock, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  CalendarDays,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// services
import { getTasks } from "../../services/TaskService";
import { getMyAttendance } from "../../services/attendanceService";
import { getSalaries } from "../../services/SalaryService";
import { getLeaves } from "../../services/LeaveService";

function Dashboard() {
  const [task, setTask] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salary, setSalary] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  const currentDate = new Date();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [taskRes, attendanceRes, salaryRes, leaveRes] = await Promise.all([
          getTasks(),
          getMyAttendance(currentDate.getMonth() + 1, currentDate.getFullYear()),
          getSalaries(),
          getLeaves(),
        ]);
        setTask(taskRes || []);
        setAttendance(attendanceRes || []);
        setSalary(salaryRes?.salaries || []);
        setLeaves(leaveRes?.leaves || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayFormatted = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Calculate quick metrics
  const pendingTasks = task.filter(t => t.status !== 'completed').length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const totalHours = attendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0).toFixed(1);
  const latestSalary = salary[0];
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;

  // Today's attendance
  const todayRecord = attendance.find(a => {
    const d = new Date(a.date);
    return (
      d.getDate() === currentDate.getDate() &&
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear()
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
          <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading workspace dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user?.role || 'Employee'} Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Department: <strong className="text-slate-200">{user?.department || 'General'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> {todayFormatted}
          </p>
        </div>

        {/* Quick Shift Status Chip */}
        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Shift</span>
            <span className="text-xs font-bold text-white">
              {todayRecord?.checkIn 
                ? todayRecord.checkOut 
                  ? "Shift Completed" 
                  : "Shift Active" 
                : "Not Checked In"}
            </span>
          </div>
          <Link 
            to="/employee/my-attendance" 
            className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs">
            Punch
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Tasks Card */}
        <Link to="/employee/my-tasks" className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{task.length}</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">{pendingTasks} pending tasks</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Attendance Card */}
        <Link to="/employee/my-attendance" className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{presentDays} <span className="text-xs font-normal text-slate-400">days</span></h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">{totalHours} hrs worked this month</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Salary Card */}
        <Link to="/employee/my-salary" className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latest Salary</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {latestSalary?.netSalary ? `₹${latestSalary.netSalary}` : '₹0'}
              </h3>
              <p className="text-[11px] text-purple-600 font-medium mt-1 capitalize">
                {latestSalary?.status ? `${latestSalary.status} • ${salary.length} slips` : 'No salary records'}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Leave Card */}
        <Link to="/employee/my-leaves" className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leave Applications</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{leaves.length}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">{approvedLeaves} approved leaves</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Left Column (Tasks & Leaves) + Right Column (Shift & Shortcuts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Section: 2 Cols Wide */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">My Active Tasks</h3>
              </div>
              <Link to="/employee/my-tasks" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4">
              {task.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                  <p className="font-semibold text-slate-600">All caught up!</p>
                  <p className="text-slate-400">No active tasks assigned to you right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {task.slice(0, 4).map((t) => (
                    <div key={t._id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">{t.title || 'Untitled Task'}</h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">{t.description || 'No description provided'}</p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'inProgress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {t.deadline ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Leave Requests</h3>
              </div>
              <Link to="/employee/my-leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Apply / View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4">
              {leaves.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <p className="font-semibold text-slate-600">No leave requests found</p>
                  <p className="text-slate-400">You haven't submitted any leave applications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leaves.slice(0, 3).map((l) => (
                    <div key={l._id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                      <div>
                        <span className="text-xs font-bold text-slate-800 capitalize">{l.leaveType} Leave</span>
                        <span className="text-[11px] text-slate-400 block">{l.reason || 'Personal'} • {l.totalDays} day(s)</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : l.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Section: Today's Shift & Quick Actions */}
        <div className="space-y-4">
          
          {/* Today's Punch Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Today's Log
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                {todayRecord?.shiftType || 'General'} Shift
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">Check-In</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {todayRecord?.checkIn 
                    ? new Date(todayRecord.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                    : '--:--'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">Check-Out</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                  {todayRecord?.checkOut 
                    ? new Date(todayRecord.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                    : '--:--'}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/60 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Logged Time:</span>
              <span className="font-bold text-indigo-700">{todayRecord?.workHours ? `${todayRecord.workHours} hrs` : '0.0 hrs'}</span>
            </div>

            <Link 
              to="/employee/my-attendance" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors">
              Manage Attendance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Link to="/employee/my-leaves" className="p-2.5 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-100 transition-colors text-center group">
                <Calendar className="w-4 h-4 mx-auto text-slate-500 group-hover:text-indigo-600 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-900 block">Apply Leave</span>
              </Link>

              <Link to="/employee/my-salary" className="p-2.5 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-100 transition-colors text-center group">
                <IndianRupee className="w-4 h-4 mx-auto text-slate-500 group-hover:text-indigo-600 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-900 block">Payslips</span>
              </Link>

              <Link to="/employee/helpdesk" className="p-2.5 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-100 transition-colors text-center group">
                <HelpCircle className="w-4 h-4 mx-auto text-slate-500 group-hover:text-indigo-600 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-900 block">AI Helpdesk</span>
              </Link>

              <Link to="/employee/notifications" className="p-2.5 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-100 transition-colors text-center group">
                <Sparkles className="w-4 h-4 mx-auto text-slate-500 group-hover:text-indigo-600 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-900 block">Updates</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
