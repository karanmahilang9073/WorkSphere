import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import Salary from "../models/Salary.js";

export const getAdminOverview = asyncHandler(async (req, res) => {
    if (!req.user || !['Admin', 'HR'].includes(req.user.role)) {
        const error = new Error('Unauthorized');
        error.statusCode = 403;
        throw error;
    }

    // 1. Employee Stats
    const totalUsers = await User.countDocuments();
    const employeesCount = await User.countDocuments({ role: { $regex: /^employee$/i } });
    const adminCount = await User.countDocuments({ role: { $regex: /^(admin|hr)$/i } });

    // Department Distribution
    const deptAgg = await User.aggregate([
        { $match: { department: { $exists: true, $ne: "" } } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    const departmentBreakdown = deptAgg.map(d => ({ department: d._id, count: d.count }));

    // 2. Attendance Stats (Today)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayAttendanceRecords = await Attendance.find({
        date: { $gte: startOfToday, $lte: endOfToday }
    }).lean();

    const todayPresent = todayAttendanceRecords.filter(a => a.status === 'present').length;
    const todayHalfDay = todayAttendanceRecords.filter(a => a.status === 'half-day').length;
    const todayLate = todayAttendanceRecords.filter(a => a.late === true).length;
    const todayTotalPunches = todayAttendanceRecords.length;

    const baseCount = employeesCount > 0 ? employeesCount : totalUsers || 1;
    const attendancePercentage = Number(((todayPresent / baseCount) * 100).toFixed(1));

    // Attendance Methods (QR vs Manual vs Geo)
    const qrCheckIns = todayAttendanceRecords.filter(a => a.checkInMethod === 'qr').length;
    const manualCheckIns = todayAttendanceRecords.filter(a => a.checkInMethod === 'manual').length;
    const geoCheckIns = todayAttendanceRecords.filter(a => a.checkInMethod === 'geo').length;

    // 3. Task Stats
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const pendingTasks = await Task.countDocuments({ status: { $in: ['pending', 'todo'] } });
    const highPriorityTasks = await Task.countDocuments({ priority: 'high' });
    const taskCompletionRate = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

    // 4. Leave Stats
    const totalLeaves = await Leave.countDocuments();
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

    const leaveTypeAgg = await Leave.aggregate([
        { $group: { _id: "$leaveType", count: { $sum: 1 } } }
    ]);
    const leaveTypes = leaveTypeAgg.map(l => ({ type: l._id || 'Standard', count: l.count }));

    // 5. Salary & Payroll Stats
    const salaryAgg = await Salary.aggregate([
        {
            $group: {
                _id: null,
                totalDisbursed: {
                    $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$netSalary", 0] }
                },
                totalPending: {
                    $sum: { $cond: [{ $ne: ["$status", "paid"] }, "$netSalary", 0] }
                },
                totalPayroll: { $sum: "$netSalary" },
                totalAllowance: { $sum: "$allowance" },
                totalDeduction: { $sum: "$deduction" },
                count: { $sum: 1 },
                paidCount: {
                    $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
                },
                pendingCount: {
                    $sum: { $cond: [{ $ne: ["$status", "paid"] }, 1, 0] }
                }
            }
        }
    ]);

    const sStats = salaryAgg[0] || {
        totalDisbursed: 0,
        totalPending: 0,
        totalPayroll: 0,
        totalAllowance: 0,
        totalDeduction: 0,
        count: 0,
        paidCount: 0,
        pendingCount: 0
    };

    const avgSalary = sStats.count > 0 ? Math.round(sStats.totalPayroll / sStats.count) : 0;

    res.status(200).json({
        success: true,
        data: {
            workforce: {
                totalUsers,
                employeesCount,
                adminCount,
                departments: departmentBreakdown
            },
            attendance: {
                todayTotalPunches,
                todayPresent,
                todayHalfDay,
                todayLate,
                todayAbsent: Math.max(0, baseCount - todayPresent - todayHalfDay),
                attendancePercentage,
                methods: {
                    qr: qrCheckIns,
                    manual: manualCheckIns,
                    geo: geoCheckIns
                }
            },
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                pending: pendingTasks,
                highPriority: highPriorityTasks,
                completionRate: taskCompletionRate
            },
            leaves: {
                total: totalLeaves,
                approved: approvedLeaves,
                pending: pendingLeaves,
                rejected: rejectedLeaves,
                types: leaveTypes
            },
            payroll: {
                totalPayroll: sStats.totalPayroll,
                totalDisbursed: sStats.totalDisbursed,
                totalPending: sStats.totalPending,
                totalAllowance: sStats.totalAllowance,
                totalDeduction: sStats.totalDeduction,
                avgSalary,
                slipsCount: sStats.count,
                paidSlips: sStats.paidCount,
                pendingSlips: sStats.pendingCount
            }
        }
    });
});

export const getEmployeeOverview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
        const error = new Error("Employee not found");
        error.statusCode = 404;
        throw error;
    }

    const tasks = await Task.find({ assignedTo: id }).lean();
    const leaves = await Leave.find({ employee: id }).lean();
    const attendance = await Attendance.find({ employee: id }).lean();
    const salaries = await Salary.find({ employee: id }).lean();

    res.status(200).json({
        success: true,
        data: {
            employee: user,
            tasks: {
                total: tasks.length,
                completed: tasks.filter(t => t.status === 'completed').length,
                pending: tasks.filter(t => t.status !== 'completed').length
            },
            leaves: {
                total: leaves.length,
                approved: leaves.filter(l => l.status === 'approved').length,
                pending: leaves.filter(l => l.status === 'pending').length,
                rejected: leaves.filter(l => l.status === 'rejected').length
            },
            attendance: {
                total: attendance.length,
                present: attendance.filter(a => a.status === 'present').length,
                late: attendance.filter(a => a.late).length,
                halfDay: attendance.filter(a => a.status === 'half-day').length
            },
            salaries: {
                total: salaries.length,
                paid: salaries.filter(s => s.status === 'paid').length,
                pending: salaries.filter(s => s.status !== 'paid').length,
                totalEarnings: salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0)
            }
        }
    });
});

