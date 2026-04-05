import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProtectedRoutes from './components/common/ProtectedRoutes'
import AuthLayout from './components/layout/AuthLayout'
import EmployeeLayout from './components/layout/EmployeeLayout'
import AdminLayout from './components/layout/Adminlayout'

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


export default function App() {
  return (
    <Routes>

      {/* Auth Routes */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

      

      {/* Employee Routes */}
      <Route element={<ProtectedRoutes><EmployeeLayout><EmployeeDash /></EmployeeLayout></ProtectedRoutes>} path="/employee" />
      <Route element={<ProtectedRoutes><EmployeeLayout><MyAttendance /></EmployeeLayout></ProtectedRoutes>} path="/employee/my-attendance" />
      <Route element={<ProtectedRoutes><EmployeeLayout><MyLeaves /></EmployeeLayout></ProtectedRoutes>} path="/employee/my-leaves" />
      <Route element={<ProtectedRoutes><EmployeeLayout><MySalary /></EmployeeLayout></ProtectedRoutes>} path="/employee/my-salary" />
      <Route element={<ProtectedRoutes><EmployeeLayout><MyTasks /></EmployeeLayout></ProtectedRoutes>} path="/employee/my-tasks" />
      <Route element={<ProtectedRoutes><EmployeeLayout><Notification/></EmployeeLayout></ProtectedRoutes>} path='/employee/notifications' />
      <Route element={<ProtectedRoutes><EmployeeLayout><Helpdesk/></EmployeeLayout></ProtectedRoutes>} path='/employee/helpdesk' />

      {/* Admin Routes */}
      <Route element={<ProtectedRoutes><AdminLayout><Dashboard /></AdminLayout></ProtectedRoutes>} path="/admin" />
      <Route element={<ProtectedRoutes><AdminLayout><Employees /></AdminLayout></ProtectedRoutes>} path="/admin/employees" />
      <Route element={<ProtectedRoutes><AdminLayout><Attendance /></AdminLayout></ProtectedRoutes>} path="/admin/attendance" />
      <Route element={<ProtectedRoutes><AdminLayout><Leave /></AdminLayout></ProtectedRoutes>} path="/admin/leaves" />
      <Route element={<ProtectedRoutes><AdminLayout><Tasks /></AdminLayout></ProtectedRoutes>} path="/admin/tasks" />
      <Route element={<ProtectedRoutes><AdminLayout><Compensations /></AdminLayout></ProtectedRoutes>} path="/admin/compensation" />
      <Route element={<ProtectedRoutes><AdminLayout><Analytics /></AdminLayout></ProtectedRoutes>} path="/admin/analytics" />

      <Route path='/' element={<Login/>} />

    </Routes>
  )
}