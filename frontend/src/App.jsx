import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProtectedRoutes from './components/common/ProtectedRoutes'
import AuthLayout from './components/layout/AuthLayout'
import EmployeeLayout from './components/layout/EmployeeLayout'
import AdminLayout from './components/layout/Adminlayout'
import { Navigate } from 'react-router-dom'
import Unauthorized from './pages/auth/Unauthorized'
import { useAuth } from './context/AuthContext'

// Employee pages
import EmployeeDash from './pages/employee/Dashboard'
import MyAttendance from './pages/employee/MyAttendance'
import MyLeaves from './pages/employee/MyLeaves'
import MySalary from './pages/employee/MySalary'
import MyTasks from './pages/employee/MyTasks'
import Notification from './pages/employee/Notification'
import Helpdesk from './pages/employee/Helpdesk'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import Employees from './pages/admin/Employee'
import Attendance from './pages/admin/Attendance'
import Leave from './pages/admin/Leaves'
import Tasks from './pages/admin/Tasks'
import Compensations from './pages/admin/Compensation'
import Analytics from './pages/admin/Analytics'
import Profile from './pages/admin/Profile'



export default function App() {

  const {user, loading} = useAuth()

  if(loading) return <div className="">loading...</div>

  return (
    <Routes>

      {/* Auth Routes */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      
      <Route path="/" element={user ? user.role === "Admin" ? <Navigate to="/admin" /> : <Navigate to="/employee" /> : <Navigate to="/login" />}/>

      {/* Employee Routes */}
      <Route element={<ProtectedRoutes role="Employee"><EmployeeLayout /></ProtectedRoutes>}>
          <Route path="/employee" element={<EmployeeDash />} />
          <Route path="/employee/my-attendance" element={<MyAttendance />} />
          <Route path="/employee/my-leaves" element={<MyLeaves />} />
          <Route path="/employee/my-salary" element={<MySalary />} />
          <Route path="/employee/my-tasks" element={<MyTasks />} />
          <Route path="/employee/notifications" element={<Notification />} />
          <Route path="/employee/helpdesk" element={<Helpdesk />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoutes role="Admin"><AdminLayout /></ProtectedRoutes>}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/attendance" element={<Attendance />} />
          <Route path="/admin/leaves" element={<Leave />} />
          <Route path="/admin/tasks" element={<Tasks />} />
          <Route path="/admin/compensation" element={<Compensations />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path='/admin/profile' element={<Profile/>} />
      </Route>


    </Routes>
  )
}