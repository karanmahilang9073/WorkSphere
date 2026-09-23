import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllAttendance, getQRToken, getOfficeLocation, updateOfficeLocation } from "../../services/attendanceService";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import { toast } from "react-toastify";
import { analyzeAttendance } from "../../services/AiService";
import {
    QrCode,
    RefreshCw,
    Sparkles,
    MapPin,
    Zap,
    Navigation,
    Crosshair,
    CheckCircle2,
    Timer,
    Clock,
    Search,
    SlidersHorizontal,
    Table as TableIcon,
    LayoutGrid,
    Calendar,
    User,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Building2,
    CheckCircle,
    Shield
} from "lucide-react";

const STATUS_COLORS = {
    present: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    "half-day": "bg-amber-50 text-amber-700 border-amber-200/80",
    incomplete: "bg-orange-50 text-orange-700 border-orange-200/80",
    absent: "bg-rose-50 text-rose-700 border-rose-200/80",
    leave: "bg-blue-50 text-blue-700 border-blue-200/80"
};

const SHIFT_BADGES = {
    morning: "bg-amber-50 text-amber-700 border-amber-200/80",
    general: "bg-blue-50 text-blue-700 border-blue-200/80",
    evening: "bg-orange-50 text-orange-700 border-orange-200/80",
    night: "bg-indigo-50 text-indigo-700 border-indigo-200/80"
};

const AVATAR_GRADIENTS = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600"
];

const getInitials = (name) => {
    if (!name) return "EM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const formatTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
};

function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // View Mode (Default to 'table')
    const [viewMode, setViewMode] = useState("table");

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [shiftFilter, setShiftFilter] = useState("ALL");

    // AI Insight
    const [aiAttendance, setAiAttendance] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
    const [showAiModal, setShowAiModal] = useState(false);

    // QR Modal
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrToken, setQrToken] = useState("");
    const [qrSecondsLeft, setQrSecondsLeft] = useState(0);

    // Office Location Modal
    const [showLocModal, setShowLocModal] = useState(false);
    const [locData, setLocData] = useState({
        name: "Main Office",
        latitude: "",
        longitude: "",
        radiusMeters: 500,
        address: "Corporate Office"
    });
    const [locLoading, setLocLoading] = useState(false);
    const [detectingGps, setDetectingGps] = useState(false);

    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllAttendance(page, 15);
            setAttendance(res.attendance || []);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            console.error("error while loading attendance", err);
            setError("Failed to load attendance records");
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [page]);

    // Handle QR Generation
    const generateNewQR = async () => {
        try {
            const data = await getQRToken();
            if (data?.qrToken) {
                setQrToken(data.qrToken);
                setQrSecondsLeft(data.expiresInSeconds || 90);
            }
        } catch {
            toast.error("Failed to generate QR token");
        }
    };

    useEffect(() => {
        let interval = null;
        if (showQRModal) {
            generateNewQR();
            interval = setInterval(() => {
                setQrSecondsLeft((prev) => {
                    if (prev <= 1) {
                        generateNewQR();
                        return 90;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showQRModal]);

    const handleAttendance = async (employeeId, employeeName = "Staff Member") => {
        setSelectedEmployeeName(employeeName);
        setShowAiModal(true);
        setAnalyzing(true);
        setAiAttendance("");
        try {
            const res = await analyzeAttendance(employeeId);
            setAiAttendance(res);
            toast.success("AI Attendance insight generated!");
        } catch (err) {
            console.error("error while analyzing attendance", err);
            setAiAttendance("Failed to generate AI performance insight. Please try again.");
            toast.error("Failed to analyze attendance");
        } finally {
            setAnalyzing(false);
        }
    };

    const fetchCurrentOfficeLocation = async () => {
        try {
            const data = await getOfficeLocation();
            if (data) {
                setLocData({
                    name: data.name || "Main Office",
                    latitude: data.latitude !== undefined ? data.latitude : "",
                    longitude: data.longitude !== undefined ? data.longitude : "",
                    radiusMeters: data.radiusMeters || 500,
                    address: data.address || "Corporate Office"
                });
            }
        } catch (err) {
            console.error("Failed to load office location", err);
        }
    };

    useEffect(() => {
        if (showLocModal) {
            fetchCurrentOfficeLocation();
        }
    }, [showLocModal]);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        setDetectingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocData((prev) => ({
                    ...prev,
                    latitude: Number(pos.coords.latitude.toFixed(6)),
                    longitude: Number(pos.coords.longitude.toFixed(6))
                }));
                setDetectingGps(false);
                toast.success("Current GPS coordinates captured!");
            },
            (err) => {
                console.error("GPS error", err);
                setDetectingGps(false);
                toast.error("Failed to detect GPS location. Please allow browser location access.");
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleSaveLocation = async (e) => {
        e.preventDefault();
        if (locData.latitude === "" || locData.longitude === "") {
            toast.error("Latitude and Longitude are required");
            return;
        }
        setLocLoading(true);
        try {
            await updateOfficeLocation(locData);
            toast.success("Office Geo-Fence location updated successfully!");
            setShowLocModal(false);
        } catch (err) {
            console.error("Failed to update office location", err);
            toast.error(err?.message || "Failed to update office location");
        } finally {
            setLocLoading(false);
        }
    };

    // Filter attendance records
    const filteredAttendance = useMemo(() => {
        return attendance.filter((item) => {
            const empName = item.employee?.name || "Staff Member";
            const empEmail = item.employee?.email || "";
            const dateStr = formatDate(item.date);

            const matchesSearch =
                empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                empEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dateStr.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "late" ? item.late : (item.status || "").toLowerCase() === statusFilter.toLowerCase());

            const matchesShift =
                shiftFilter === "ALL" ||
                (item.shift || "").toLowerCase() === shiftFilter.toLowerCase() ||
                (item.shiftType || "").toLowerCase() === shiftFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesShift;
        });
    }, [attendance, searchQuery, statusFilter, shiftFilter]);

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization Attendance</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {attendance.length} Logs
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Real-time shifts, punctuality, geo-verified punches, and overtime logs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                    <Link
                        to="/admin/shifts"
                        className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200/90 text-xs shadow-2xs transition"
                    >
                        <Timer className="w-4 h-4 text-indigo-600" />
                        <span>Shift Timings</span>
                    </Link>

                    <button
                        onClick={() => setShowLocModal(true)}
                        className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200/90 text-xs shadow-2xs transition"
                    >
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span>Office Geo-Fence</span>
                    </button>

                    <button
                        onClick={() => setShowQRModal(true)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 shadow-xs transition text-xs"
                    >
                        <QrCode className="w-4 h-4" />
                        <span>Live QR Kiosk</span>
                    </button>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3.5 justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employee, email, date..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9.5 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filters & View Toggle */}
                <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filters:</span>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half-Day</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="absent">Absent</option>
                    </select>

                    {/* Shift Filter */}
                    <select
                        value={shiftFilter}
                        onChange={(e) => setShiftFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
                    >
                        <option value="ALL">All Shifts</option>
                        <option value="morning">Morning Shift</option>
                        <option value="general">General Shift</option>
                        <option value="evening">Evening Shift</option>
                        <option value="night">Night Shift</option>
                    </select>

                    {/* View Switcher (Table vs Grid) */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-0.5 ml-auto md:ml-0">
                        <button
                            onClick={() => setViewMode("table")}
                            title="Table View"
                            className={`p-1.5 rounded-lg transition ${
                                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs font-semibold" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            title="Card View"
                            className={`p-1.5 rounded-lg transition ${
                                viewMode === "card" ? "bg-white text-indigo-600 shadow-2xs font-semibold" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={fetchAttendance}
                        title="Refresh Attendance"
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="text-xs font-medium">Loading attendance records...</span>
                    </div>
                ) : filteredAttendance.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">No attendance records found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                    </div>
                ) : viewMode === "table" ? (
                    /* Tabular Format */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Employee</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4">Shift</th>
                                    <th className="py-3.5 px-4">Check-In</th>
                                    <th className="py-3.5 px-4">Check-Out</th>
                                    <th className="py-3.5 px-4">Work Hours</th>
                                    <th className="py-3.5 px-4">Method</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredAttendance.map((item, idx) => {
                                    const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                                    const empName = item.employee?.name || "Staff Member";
                                    const empEmail = item.employee?.email || "employee@company.com";
                                    const shiftKey = (item.shift || item.shiftType || "general").toLowerCase();
                                    const shiftBadge = SHIFT_BADGES[shiftKey] || SHIFT_BADGES.general;
                                    const statusKey = (item.status || "present").toLowerCase();
                                    const statusClass = STATUS_COLORS[statusKey] || STATUS_COLORS.present;

                                    const isCompleted = Boolean(item.checkIn && item.checkOut);
                                    const hoursDisplay = isCompleted
                                        ? `${(item.workHours || 0).toFixed(1)} hrs`
                                        : item.checkIn
                                        ? "In progress"
                                        : "--";

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Employee */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                                                    >
                                                        {getInitials(empName)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-slate-900 block text-xs truncate">
                                                            {empName}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 block truncate">
                                                            {empEmail}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{formatDate(item.date)}</span>
                                                </div>
                                            </td>

                                            {/* Shift */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${shiftBadge} capitalize`}
                                                >
                                                    {item.shiftType || item.shift || "General"}
                                                </span>
                                            </td>

                                            {/* Check-In */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-slate-800">
                                                        {formatTime(item.checkIn)}
                                                    </span>
                                                    {item.late && (
                                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                                            Late
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Check-Out */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="font-semibold text-slate-800">
                                                    {formatTime(item.checkOut)}
                                                </span>
                                            </td>

                                            {/* Work Hours & Overtime */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`font-semibold ${
                                                            isCompleted ? "text-indigo-600" : "text-amber-600"
                                                        }`}
                                                    >
                                                        {hoursDisplay}
                                                    </span>
                                                    {item.overtimeHours > 0 && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                                                            +{item.overtimeHours}h OT
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Method & Location */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {item.checkInMethod === "qr" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
                                                        <QrCode className="w-3 h-3 text-indigo-600" />
                                                        Office QR
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                                                        <MapPin className="w-3 h-3 text-emerald-600" />
                                                        Geo-Fence
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${statusClass}`}
                                                >
                                                    {item.status?.replace("-", " ") || "PRESENT"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleAttendance(item.employee?._id || item.employee, empName)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition shadow-2xs"
                                                    title="Generate AI Performance Review"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                                    <span>Analyze AI</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Fallback Card View */
                    <div className="p-5 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredAttendance.map((a) => (
                            <AttendanceCard
                                key={a._id}
                                attendance={a}
                                onAnalyze={(empId) => handleAttendance(empId, a.employee?.name || "Staff Member")}
                            />
                        ))}
                    </div>
                )}

                {/* Table Footer with Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
                    <span className="text-xs text-slate-500">
                        Showing <strong className="text-slate-700">{filteredAttendance.length}</strong> of{" "}
                        <strong className="text-slate-700">{attendance.length}</strong> attendance records
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </button>

                        <span className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-indigo-600">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page >= totalPages || loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Insight Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-indigo-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">AI Attendance & Punctuality Insight</h3>
                                    <p className="text-[11px] text-slate-500">Employee: {selectedEmployeeName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {analyzing ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-medium">WorkSphere AI is analyzing punctuality and work patterns...</span>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                                    {aiAttendance}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                            >
                                Close Insight
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Office QR Kiosk Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-600" /> Office Attendance QR Kiosk
                            </h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg hover:bg-slate-100"
                            >
                                ×
                            </button>
                        </div>

                        <p className="text-xs text-slate-500">
                            Employees can scan this dynamic QR code to clock in. Code auto-refreshes every 90 seconds for security.
                        </p>

                        {/* QR Image */}
                        <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            {qrToken ? (
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrToken)}`}
                                    alt="Attendance QR Code"
                                    className="w-52 h-52 object-contain"
                                />
                            ) : (
                                <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl text-xs text-indigo-900 font-medium">
                            <span>Auto-refreshing in:</span>
                            <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg shadow-2xs">
                                {qrSecondsLeft}s
                            </span>
                        </div>

                        <div className="text-left bg-slate-50 p-3 rounded-xl">
                            <p className="text-[11px] text-slate-500 mb-1">Manual Token Code (Fallback):</p>
                            <p className="text-[10px] font-mono text-slate-700 break-all select-all bg-white p-2 rounded border border-slate-200">
                                {qrToken || "Generating..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Office Location Modal */}
            {showLocModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Configure Office Geo-Fence</h3>
                                    <p className="text-xs text-slate-500">Allowed perimeter for employee mobile check-ins</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLocModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg hover:bg-slate-100"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSaveLocation} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Office Name / Branch</label>
                                <input
                                    type="text"
                                    value={locData.name}
                                    onChange={(e) => setLocData({ ...locData, name: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={locData.latitude}
                                        onChange={(e) => setLocData({ ...locData, latitude: e.target.value })}
                                        placeholder="e.g. 28.6139"
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={locData.longitude}
                                        onChange={(e) => setLocData({ ...locData, longitude: e.target.value })}
                                        placeholder="e.g. 77.2090"
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={detectingGps}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/80 transition"
                            >
                                <Crosshair className={`w-3.5 h-3.5 ${detectingGps ? "animate-spin" : ""}`} />
                                <span>{detectingGps ? "Detecting GPS..." : "Set to My Current GPS Location"}</span>
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Radius (Meters)</label>
                                    <input
                                        type="number"
                                        value={locData.radiusMeters}
                                        onChange={(e) => setLocData({ ...locData, radiusMeters: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address Label</label>
                                    <input
                                        type="text"
                                        value={locData.address}
                                        onChange={(e) => setLocData({ ...locData, address: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowLocModal(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={locLoading}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                                >
                                    {locLoading ? "Saving..." : "Save Geo-Fence"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Attendance;
