import { useEffect, useState } from "react";
import {ListTodo, Clock, DollarSign, Calendar} from 'lucide-react'
import StatsCard from "../../components/common/StatsCard";

//services
import { getTasks } from "../../services/TaskService";
import { getMyAttendance } from "../../services/attendanceService";
import { getSalaries } from "../../services/SalaryService";
import { getLeaves } from "../../services/LeaveService";

//cards
import TaskCard from "../../components/task/TaskCard";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import SalaryCard from "../../components/salary/SalaryCard";
import LeaveCard from "../../components/leave/LeaveCard";

function Dashboard() {
  const [task, setTask] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salary, setSalary] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true)
      try {
        const [taskRes, attendanceRes, salaryRes, leaveRes] = await Promise.all([
            getTasks(),
            getMyAttendance(today.getMonth() + 1, today.getFullYear()),
            getSalaries(),
            getLeaves(),
        ]);
        setTask(taskRes || []);
        setAttendance(attendanceRes || []);
        setSalary(salaryRes || []);
        setLeaves(leaveRes || []);
      } catch (error) {
        console.error("dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 ">
      <h1 className="text-2xl font-bold">Employee Dashboard</h1>

      {/* grid layout */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
        
        {/* TASKS */}
        <StatsCard title='Tasks' icon={ListTodo} value={task.length} bgGradient='bg-gradient-to-br from-blue-400 to-blue-600'>
          {task.length === 0 ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <ListTodo size={20} />
              <p>No Tasks found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {task.slice(0,2).map((t) => (
                <div key={t._id} className='bg-white p-3 rounded-lg flex justify-between items-center text-sm shadow-sm'>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'inProgress' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                  <span className="text-gray-600 text-xs ">{t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}</span>
                </div>
              ))}
            </div>
          )}
        </StatsCard>

        {/* attendance */}
        <StatsCard title='Attendance' icon={Clock} value={attendance.length} bgGradient='bg-gradient-to-br from-green-400 to-green-600'>
          {attendance.length === 0 ? (
            <p className="text-gray-500">No attendance</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 ">
              {[...attendance].reverse().slice(0, 2).map((a) => (
                <div key={a._id} className="bg-white p-2 rounded-lg text-xs">
                  <p className="text-gray-600 font-medium">{new Date(a.date).toLocaleTimeString()}</p>
                  <div className="flex justify-between gap-2 mt-1">
                    <div>
                      <span className="text-gray-500 ">Check-in:</span>
                      <p className="text-sm font-semibold text-black">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-In', {hour:'2-digit', minute:"2-digit"}) : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <p className="text-sm font-semibold text-black">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-In', {hour:'2-digit', minute:"2-digit"}) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StatsCard>

        {/* salary */}
        <StatsCard title='Salary' icon={DollarSign} value={salary.length} bgGradient='bg-gradient-to-br from-purple-400 to-purple-600' subText='pending salary'>
          {salary.length === 0 ? (
            <p className="text-gray-500">No salary records</p>
          ) : (
            <div className="space-y-2">
              {salary.slice(0, 1).map((s) => (
                <div key={s._id} className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{new Date(s.month).toLocaleDateString('en-In', {month:'long',year:'numeric'})}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-bold text-gray-800">₹{s.netSalary}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.status === 'paid' ? 'bg-green-100 text-green-700' : s.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StatsCard>

        {/* leave */}
        <StatsCard title='Leave' icon={Calendar} value={leaves.length} bgGradient='bg-gradient-to-br from-yellow-400 to-yellow-600' subText='pending leaves'>
          {leaves.length === 0 ? (
            <p className="text-gray-500">No leaves</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {leaves.slice(0, 2).map((l) => (
                <div key={l._id} className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{l.type}</p>
                  <div className="flex justify-between items-center">
                    {/* <span className="text-lg font-bold text-blue-600">{days} days</span> */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StatsCard>
      </div>
    </div>
  );
}

export default Dashboard;
