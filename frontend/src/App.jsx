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

// Admin pages
import AdminDash from './pages/admin/Dashboard'

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

      {/* Admin Routes */}
      <Route element={<ProtectedRoutes><AdminLayout><AdminDash /></AdminLayout></ProtectedRoutes>} path="/admin" />
    </Routes>
  )
}