import { useEffect, useState } from "react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* TASKS */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Tasks</h2>
          {task.length === 0 ? (
            <p className="text-gray-500">No tasks</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {task.slice(0, 3).map((t) => (
                <TaskCard key={t._id} task={t} />
              ))}
            </div>
          )}
        </div>

        {/* attendance */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Attendance</h2>
          {attendance.length === 0 ? (
            <p className="text-gray-500">No attendance</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {attendance.slice(0, 3).map((a) => (
                <AttendanceCard key={a._id} attendance={a} />
              ))}
            </div>
          )}
        </div>

        {/* salary */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Salary</h2>
          {salary.length === 0 ? (
            <p className="text-gray-500">No salary records</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {salary.slice(0, 1).map((s) => (
                <SalaryCard key={s._id} salary={s} />
              ))}
            </div>
          )}
        </div>

        {/* leave */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Leaves</h2>
          {leaves.length === 0 ? (
            <p className="text-gray-500">No leaves</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {leaves.slice(0, 2).map((l) => (
                <LeaveCard key={l._id} leave={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
