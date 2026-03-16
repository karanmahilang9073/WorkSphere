# AstraaHR

AstraaHR is an HRMS platform with two roles:
- HR/Admin
- Employee

It includes employee management, tasks, attendance, leave, compensation, AI helpdesk, real-time notifications, and email alerts.

---

## 1) What You Are Building

### Roles
- **HR/Admin**
  - Manage employees
  - Assign tasks
  - Approve leave
  - View attendance + analytics
  - Manage compensation
- **Employee**
  - View assigned tasks
  - Track attendance
  - Apply for leave
  - View salary + payslips
  - Use AI helpdesk

### Core Modules
- Employee Management
- Task Management (To Do / In Progress / Done)
- Attendance (check-in/check-out + reports)
- Leave Management
- Compensation Dashboard
- AI Helpdesk + AI Task Assistant
- Socket.io Notifications
- Email Functionality

### Tech Stack
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- AI: Hugging Face API + Mistral 7B Instruct
- Real-time: Socket.io
- Email: Nodemailer

---

## 2) Current Project Status (Based on Existing Files)

### Already Present
- `backend/server.js`
- `backend/config/db.js`
- `backend/middlewares/asyncHandler.js`
- Models present:
  - `backend/models/User.js`
  - `backend/models/Task.js`
  - `backend/models/Attendance.js` (empty)
  - `backend/models/Leave.js` (empty)
  - `backend/models/Salary.js` (empty)
  - `backend/models/Notification.js` (empty)

### Missing / Next Work
- Controllers, routes, and services implementation
- Auth + authorization middleware
- Frontend app setup and pages
- AI, email, and socket integration
- Testing and deployment setup

---

## 3) Final Target Folder Plan

Use this target structure while building:

```text
AstraaHR/
  backend/
    server.js
    package.json
    .env
    config/
      db.js
      socket.js
      mail.js
    controllers/
      authController.js
      userController.js
      taskController.js
      attendanceController.js
      leaveController.js
      salaryController.js
      aiController.js
      notificationController.js
    middlewares/
      asyncHandler.js
      authMiddleware.js
      roleMiddleware.js
      errorMiddleware.js
      validateMiddleware.js
    models/
      User.js
      Task.js
      Attendance.js
      Leave.js
      Salary.js
      Notification.js
      Payslip.js
    routes/
      authRoutes.js
      userRoutes.js
      taskRoutes.js
      attendanceRoutes.js
      leaveRoutes.js
      salaryRoutes.js
      aiRoutes.js
      notificationRoutes.js
    services/
      aiService.js
      mailService.js
      notificationService.js
      payrollService.js
    utils/
      generateToken.js
      dateUtils.js
      responseHelper.js
      constants.js
    tests/

  frontend/
    package.json
    index.html
    src/
      main.jsx
      App.jsx
      api/
        axiosClient.js
      components/
        common/
        task/
        attendance/
        leave/
        salary/
        ai/
      pages/
        auth/
          Login.jsx
        admin/
          Dashboard.jsx
          Employees.jsx
          Tasks.jsx
          Attendance.jsx
          Leaves.jsx
          Compensation.jsx
          Analytics.jsx
        employee/
          Dashboard.jsx
          MyTasks.jsx
          MyAttendance.jsx
          MyLeaves.jsx
          MySalary.jsx
          Helpdesk.jsx
      context/
        AuthContext.jsx
        SocketContext.jsx
      hooks/
      utils/
      styles/
```

---

## 4) Easy Step-by-Step Roadmap (Do This Order)

## Phase 0: Project Setup (Day 1)

### Backend
1. In `backend/.env`, add:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `HUGGINGFACE_API_KEY`
   - `HUGGINGFACE_MODEL` (Mistral 7B Instruct model id)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
   - `CLIENT_URL`
2. Install required backend packages:
   - `jsonwebtoken`
   - `bcrypt`
   - `socket.io`
   - `nodemailer`
   - `axios`
   - `express-validator`
   - `helmet`
   - `morgan`
3. Update `backend/server.js`:
   - add CORS, helmet, logger
   - mount API routes
   - add global error middleware
   - integrate Socket.io server

### Frontend
1. Initialize React app in `frontend/` (Vite recommended).
2. Install:
   - `react-router-dom`
   - `axios`
   - `socket.io-client`
   - `tailwindcss`
3. Setup Tailwind and base layout.

### Done When
- Backend and frontend both run locally.
- You can open frontend and hit a health API.

---

## Phase 1: Authentication + Role Access (Day 2-3)

### Create Files
- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `backend/middlewares/authMiddleware.js`
- `backend/middlewares/roleMiddleware.js`
- `backend/utils/generateToken.js`

### Features
- Register user (admin can create employee)
- Login with JWT
- Role-based access:
  - HR/Admin routes protected
  - Employee routes protected

### API Checklist
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Done When
- Login works for Admin and Employee.
- Unauthorized role gets blocked correctly.

---

## Phase 2: Employee Management (Day 4-5)

### Create Files
- `backend/controllers/userController.js`
- `backend/routes/userRoutes.js`

### Features
- Add employee profile
- Update employee profile
- Deactivate employee
- Department and position updates
- Employee directory with search/filter

### API Checklist
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Done When
- HR/Admin can fully manage employee records.
- Employee can only view own profile.

---

## Phase 3: Task Management (Day 6-7)

### Update/Create Files
- `backend/models/Task.js` (fix status type as single string or proper workflow history)
- `backend/controllers/taskController.js`
- `backend/routes/taskRoutes.js`
- `frontend/src/pages/admin/Tasks.jsx`
- `frontend/src/pages/employee/MyTasks.jsx`

### Features
- Assign tasks
- Move task across board columns:
  - To Do
  - In Progress
  - Done
- Deadline and progress tracking
- Missed deadline handling

### API Checklist
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/my`
- `PATCH /api/tasks/:id/status`
- `PUT /api/tasks/:id`

### Done When
- Admin assigns tasks.
- Employees update their task status.

---

## Phase 4: Attendance System (Day 8-9)

### Update/Create Files
- `backend/models/Attendance.js`
- `backend/controllers/attendanceController.js`
- `backend/routes/attendanceRoutes.js`

### Attendance Model Fields
- `employee`
- `date`
- `checkInTime`
- `checkOutTime`
- `workedHours`
- `status` (Present / Half Day / Absent)

### Features
- Daily check-in/check-out
- Auto-calculate work hours
- Attendance report by month
- HR analytics view

### API Checklist
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance/my`
- `GET /api/attendance/report`

### Done When
- Employee attendance logs are reliable.
- HR can export/report attendance.

---

## Phase 5: Leave Management (Day 10-11)

### Update/Create Files
- `backend/models/Leave.js`
- `backend/controllers/leaveController.js`
- `backend/routes/leaveRoutes.js`

### Leave Model Fields
- `employee`
- `leaveType` (Sick, Casual, Paid)
- `fromDate`, `toDate`
- `reason`
- `status` (Pending, Approved, Rejected)
- `approvedBy`
- `balanceAfterApproval`

### Features
- Employee leave application
- HR approval/rejection
- Leave balance tracking
- Email + notification on status change

### API Checklist
- `POST /api/leaves`
- `GET /api/leaves/my`
- `GET /api/leaves/pending`
- `PATCH /api/leaves/:id/approve`
- `PATCH /api/leaves/:id/reject`

### Done When
- Full leave cycle works with balance updates.

---

## Phase 6: Compensation + Payslips (Day 12-14)

### Update/Create Files
- `backend/models/Salary.js`
- `backend/models/Payslip.js`
- `backend/controllers/salaryController.js`
- `backend/routes/salaryRoutes.js`
- `backend/services/payrollService.js`

### Salary/Payslip Fields
- Basic salary
- Allowances
- Bonus
- Deductions
- Net salary
- Month/year
- Payslip URL or generated PDF path

### Features
- HR can manage salary components
- Monthly payroll calculation
- Employee sees salary breakdown
- Download payslip

### API Checklist
- `POST /api/salary`
- `GET /api/salary/my`
- `GET /api/salary/:employeeId`
- `GET /api/salary/:employeeId/payslips`

### Done When
- Employee can see salary details and download payslip.

---

## Phase 7: AI Integration (Day 15-16)

### Create Files
- `backend/services/aiService.js`
- `backend/controllers/aiController.js`
- `backend/routes/aiRoutes.js`
- `frontend/src/pages/employee/Helpdesk.jsx`

### AI Features
1. **AI Helpdesk**
   - "Show my tasks"
   - "How many leave days do I have?"
   - "Download my payslip"
2. **AI Task Assistant**
   - Suggest task breakdown
   - Help plan daily/weekly work

### Implementation Notes
- Use Hugging Face Inference API with Mistral 7B Instruct model.
- Build a safe system prompt:
  - No data leakage across users.
  - Employee only accesses own data.
- For action requests (like download payslip), map AI intent to internal APIs.

### Done When
- AI responses are useful and role-safe.

---

## Phase 8: Real-time Notifications (Day 17)

### Create Files
- `backend/config/socket.js`
- `backend/services/notificationService.js`
- `backend/controllers/notificationController.js`
- `backend/routes/notificationRoutes.js`
- `frontend/src/context/SocketContext.jsx`

### Notification Events
- New task assigned
- Leave approved/rejected
- Payroll generated
- Reminder for pending check-out

### Done When
- Users receive real-time app notifications without refresh.

---

## Phase 9: Email Functionality (Day 18)

### Create Files
- `backend/config/mail.js`
- `backend/services/mailService.js`
- `backend/utils/emailTemplates.js`

### Send Emails For
- Welcome account email
- Task assignment alert
- Leave approval/rejection
- Payslip published
- Password reset (optional)

### Done When
- All critical user events send clean email notifications.

---

## Phase 10: Frontend Completion (Day 19-21)

### Build Pages
- Admin dashboard + analytics
- Employee dashboard
- Task Kanban board
- Attendance calendar/report
- Leave application and approval views
- Salary and payslip page
- AI helpdesk chat UI

### Done When
- End-to-end user journeys are complete for both roles.

---

## Phase 11: Testing + Hardening (Day 22-23)

### Backend Testing
- Unit test services
- API tests for auth, task, leave, attendance, salary
- Validation and error-path tests

### Security + Stability
- Input validation
- Rate limiting for auth and AI endpoints
- Proper logging and centralized error handling
- Data access checks on every role-specific endpoint

### Done When
- No major bugs in happy path and key edge cases.

---

## Phase 12: Deployment (Day 24)

### Backend Deploy
- Deploy API (Render/Railway/AWS/etc)
- Set production env vars

### Frontend Deploy
- Deploy React app (Vercel/Netlify)
- Set API base URL

### Final Validation
- Login, task, attendance, leave, salary, AI, notifications, email all verified in production.

---

## 5) API Map (Quick Reference)

- Auth: `/api/auth/*`
- Users: `/api/users/*`
- Tasks: `/api/tasks/*`
- Attendance: `/api/attendance/*`
- Leaves: `/api/leaves/*`
- Salary: `/api/salary/*`
- AI: `/api/ai/*`
- Notifications: `/api/notifications/*`

---

## 6) Daily Work Plan (Very Simple)

Use this repeatable cycle every day:

1. Pick one module (example: Leave).
2. Finish backend first:
   - model -> controller -> route -> validation -> role checks.
3. Test API using Postman.
4. Build frontend screens for that module.
5. Connect frontend to API.
6. Add notification/email hooks.
7. Re-test full flow.
8. Commit code with clear message.

---

## 7) Recommended Milestones

- **Milestone 1:** Auth + Employee + Task complete
- **Milestone 2:** Attendance + Leave complete
- **Milestone 3:** Salary + Payslips complete
- **Milestone 4:** AI + Socket + Email complete
- **Milestone 5:** Testing + Deployment complete

---

## 8) Useful Commands

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 9) Key Notes Before Coding

- Keep all date/time handling consistent (UTC in DB, local in UI display).
- Keep role checks strict in every protected route.
- Never expose one employee's salary/leave/task data to another employee.
- AI should call internal APIs, not raw DB directly from prompt decisions.
- Send both in-app notification and email for high-impact events.

---

## 10) Definition of Project Complete

Project is complete when:
- HR/Admin and Employee both can log in and complete all module workflows.
- AI helpdesk answers role-safe queries and supports task planning.
- Real-time notifications and email alerts work for all key events.
- Salary and payslip features are fully usable.
- App is deployed with working production environment.

---

## 11) Complete Function Blueprint (What to Implement in Each Section)

Use this as a direct coding checklist. Function names are suggestions, but keep naming consistent.

### A) Auth Section

**File: `backend/controllers/authController.js`**
- `registerUser(req, res)`
- `loginUser(req, res)`
- `getMe(req, res)`
- `changePassword(req, res)`
- `forgotPassword(req, res)` (optional)
- `resetPassword(req, res)` (optional)

**File: `backend/middlewares/authMiddleware.js`**
- `protect(req, res, next)`
- `attachUserFromToken(req, res, next)` (optional)

**File: `backend/middlewares/roleMiddleware.js`**
- `allowRoles(...roles)`

**File: `backend/utils/generateToken.js`**
- `generateToken(userId, role)`
- `verifyToken(token)`

### B) Employee Management Section

**File: `backend/controllers/userController.js`**
- `createEmployee(req, res)`
- `getAllEmployees(req, res)`
- `getEmployeeById(req, res)`
- `updateEmployee(req, res)`
- `deleteEmployee(req, res)`
- `deactivateEmployee(req, res)`
- `reactivateEmployee(req, res)`
- `getMyProfile(req, res)`
- `updateMyProfile(req, res)`

**Useful service functions (optional in `backend/services/userService.js`)**
- `buildEmployeeFilters(query)`
- `sanitizeEmployeePayload(body)`
- `calculateDirectoryStats(users)`

### C) Task Management Section

**File: `backend/controllers/taskController.js`**
- `createTask(req, res)`
- `getAllTasks(req, res)`
- `getTaskById(req, res)`
- `getMyTasks(req, res)`
- `updateTask(req, res)`
- `updateTaskStatus(req, res)`
- `deleteTask(req, res)`
- `getTaskAnalytics(req, res)`

**File: `backend/services/taskService.js` (recommended)**
- `validateTaskDates(deadline)`
- `mapTaskBoardStatus(status)`
- `getOverdueTasks(tasks)`
- `calculateTaskProgress(task)`
- `buildTaskReminderPayload(task)`

### D) Attendance Section

**File: `backend/controllers/attendanceController.js`**
- `checkIn(req, res)`
- `checkOut(req, res)`
- `getMyAttendance(req, res)`
- `getAttendanceReport(req, res)`
- `getAttendanceByEmployee(req, res)`
- `markManualAttendance(req, res)` (HR/Admin)

**File: `backend/services/attendanceService.js` (recommended)**
- `getTodayAttendance(employeeId)`
- `calculateWorkedHours(checkInTime, checkOutTime)`
- `resolveAttendanceStatus(workedHours)`
- `buildAttendanceSummary(records)`
- `validateAttendanceTransition(record, action)`

### E) Leave Section

**File: `backend/controllers/leaveController.js`**
- `applyLeave(req, res)`
- `getMyLeaves(req, res)`
- `getPendingLeaves(req, res)`
- `approveLeave(req, res)`
- `rejectLeave(req, res)`
- `cancelLeave(req, res)`
- `getLeaveBalance(req, res)`

**File: `backend/services/leaveService.js` (recommended)**
- `calculateLeaveDays(fromDate, toDate)`
- `checkLeaveOverlap(employeeId, fromDate, toDate)`
- `validateLeaveBalance(employeeId, leaveType, days)`
- `applyBalanceDeduction(employeeId, leaveType, days)`
- `buildLeaveStatusNotification(leave, status)`

### F) Compensation + Payslip Section

**File: `backend/controllers/salaryController.js`**
- `createOrUpdateSalaryStructure(req, res)`
- `getMySalary(req, res)`
- `getEmployeeSalary(req, res)`
- `generateMonthlyPayroll(req, res)`
- `generatePayslip(req, res)`
- `downloadPayslip(req, res)`
- `getPayslipHistory(req, res)`

**File: `backend/services/payrollService.js`**
- `calculateGrossSalary(salary)`
- `calculateTotalDeductions(salary)`
- `calculateNetSalary(salary)`
- `generatePayslipData(employee, salary, month, year)`
- `createPayslipPdf(payslipData)`
- `storePayslipFile(fileBuffer, fileName)`

### G) AI Helpdesk + Task Assistant Section

**File: `backend/controllers/aiController.js`**
- `askHelpdesk(req, res)`
- `suggestTaskBreakdown(req, res)`
- `planWorkday(req, res)`

**File: `backend/services/aiService.js`**
- `callMistralModel(prompt, options)`
- `buildSystemPrompt(user)`
- `detectIntent(message)`
- `routeIntentToAction(intent, context)`
- `buildHelpdeskContext(userId)`
- `sanitizeAiOutput(text)`
- `enforceRoleSafeResponse(user, result)`

### H) Notification Section (Socket.io + DB)

**File: `backend/controllers/notificationController.js`**
- `getMyNotifications(req, res)`
- `markNotificationAsRead(req, res)`
- `markAllNotificationsAsRead(req, res)`
- `deleteNotification(req, res)`

**File: `backend/services/notificationService.js`**
- `createNotification(payload)`
- `emitNotificationToUser(io, userId, notification)`
- `emitNotificationToRole(io, role, notification)`
- `sendTaskAssignedNotification(task)`
- `sendLeaveStatusNotification(leave, status)`
- `sendPayrollGeneratedNotification(payslip)`

**File: `backend/config/socket.js`**
- `initSocket(server)`
- `registerSocketHandlers(io)`
- `joinUserRoom(socket, userId)`
- `disconnectHandler(socket)`

### I) Email Section

**File: `backend/services/mailService.js`**
- `sendMail({ to, subject, html, text })`
- `sendWelcomeEmail(user)`
- `sendTaskAssignedEmail(user, task)`
- `sendLeaveDecisionEmail(user, leave, status)`
- `sendPayslipEmail(user, payslip)`
- `sendPasswordResetEmail(user, resetLink)`

**File: `backend/utils/emailTemplates.js`**
- `welcomeTemplate(user)`
- `taskAssignedTemplate(user, task)`
- `leaveApprovedTemplate(user, leave)`
- `leaveRejectedTemplate(user, leave)`
- `payslipPublishedTemplate(user, payslip)`

### J) Shared Middleware + Utility Section

**File: `backend/middlewares/validateMiddleware.js`**
- `validateRequest(req, res, next)`

**File: `backend/middlewares/errorMiddleware.js`**
- `notFound(req, res, next)`
- `errorHandler(err, req, res, next)`

**File: `backend/utils/responseHelper.js`**
- `successResponse(res, data, message, statusCode = 200)`
- `errorResponse(res, message, statusCode = 500, details = null)`

**File: `backend/utils/dateUtils.js`**
- `toUtcDate(input)`
- `formatDateForUi(date)`
- `getMonthRange(year, month)`
- `isWeekend(date)`

### K) Frontend Functions by Area

**Auth (`frontend/src/context/AuthContext.jsx`)**
- `login(credentials)`
- `logout()`
- `loadCurrentUser()`
- `hasRole(role)`

**Tasks (`frontend/src/pages/admin/Tasks.jsx`, `frontend/src/pages/employee/MyTasks.jsx`)**
- `fetchTasks()`
- `createTask(payload)`
- `updateTaskStatus(taskId, status)`
- `filterTasks(filters)`

**Attendance (`frontend/src/pages/employee/MyAttendance.jsx`)**
- `handleCheckIn()`
- `handleCheckOut()`
- `fetchMyAttendance(params)`

**Leave (`frontend/src/pages/employee/MyLeaves.jsx`, `frontend/src/pages/admin/Leaves.jsx`)**
- `applyLeave(payload)`
- `fetchMyLeaves()`
- `approveLeave(leaveId)`
- `rejectLeave(leaveId)`

**Salary (`frontend/src/pages/employee/MySalary.jsx`)**
- `fetchMySalary()`
- `fetchMyPayslips()`
- `downloadPayslip(payslipId)`

**AI Helpdesk (`frontend/src/pages/employee/Helpdesk.jsx`)**
- `sendHelpdeskMessage(message)`
- `requestTaskBreakdown(taskText)`
- `requestWorkPlan(input)`

**Socket (`frontend/src/context/SocketContext.jsx`)**
- `connectSocket(token)`
- `disconnectSocket()`
- `subscribeToNotifications(handler)`

### L) Minimum Testing Functions

**Auth tests**
- `shouldLoginWithValidCredentials()`
- `shouldRejectInvalidCredentials()`

**Task tests**
- `shouldCreateTaskAsAdmin()`
- `shouldPreventTaskCreateAsEmployee()`
- `shouldUpdateTaskStatusByOwner()`

**Leave tests**
- `shouldApplyLeave()`
- `shouldApproveLeaveAsAdmin()`
- `shouldRejectWhenLeaveBalanceLow()`

**Attendance tests**
- `shouldCheckInOncePerDay()`
- `shouldCalculateWorkedHoursOnCheckout()`

**Salary tests**
- `shouldCalculateNetSalaryCorrectly()`
- `shouldGeneratePayslipForMonth()`

### M) Suggested Implementation Order for Functions

1. Auth middleware + token functions
2. User CRUD functions
3. Task functions
4. Attendance functions
5. Leave functions
6. Payroll + payslip functions
7. Notification and email functions
8. AI functions
9. Frontend action functions
10. Tests for all critical flows

---

If you want, next step can be: start **Phase 1** and I can generate all auth files (`authController`, `authRoutes`, `authMiddleware`, `roleMiddleware`, `generateToken`) for your existing backend structure.