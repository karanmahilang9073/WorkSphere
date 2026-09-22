import { useState, useEffect } from "react";
import { getAllAttendance, getQRToken } from "../../services/attendanceService";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import { toast } from "react-toastify";
import { analyzeAttendance } from "../../services/AiService";
import { QrCode, RefreshCw, Sparkles, MapPin, Zap } from "lucide-react";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [aiAttendance, setAiAttendance] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [qrSecondsLeft, setQrSecondsLeft] = useState(0);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAttendance(page, 10);
      setAttendance(res.attendance || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("error while loading attendance", err);
      setError("failed to load attendances");
      toast.error("failed to fetch attendance");
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

  const handleAttendance = async (employeeId) => {
    setAnalyzing(true);
    try {
      const res = await analyzeAttendance(employeeId);
      setAiAttendance(res);
      toast.success("Attendance analyzed successfully");
    } catch (err) {
      console.error("error while analyzing attendance", err);
      toast.error("Failed to analyze attendance");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor real-time shifts, geo-verified check-ins, and overtime logs
          </p>
        </div>

        <button
          onClick={() => setShowQRModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm">
          <QrCode className="w-4 h-4" /> Launch Live Office QR Kiosk
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main List */}
        <div className="flex-1 w-full space-y-4">
          {loading && (
            <div className="flex justify-center py-12 items-center gap-2 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" /> Loading attendance records...
            </div>
          )}

          {error && <div className="text-rose-500 text-center py-4">{error}</div>}

          {!loading && !error && attendance.length === 0 && (
            <div className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-100">
              No attendance records found
            </div>
          )}

          {!loading && !error && attendance.length > 0 && (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {attendance.map((a) => (
                  <AttendanceCard key={a._id} attendance={a} onAnalyze={handleAttendance} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* AI Insight Sidebar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 lg:w-96 w-full shrink-0 sticky top-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-indigo-600" /> AI Attendance Insights
          </h3>

          {analyzing ? (
            <div className="py-8 text-center text-gray-500 flex flex-col items-center gap-2 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              Generating insights...
            </div>
          ) : aiAttendance ? (
            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              {aiAttendance}
            </div>
          ) : (
            <div className="text-gray-400 text-xs py-8 text-center bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
              Click <span className="font-medium text-indigo-600">"Analyze with AI"</span> on any attendance card to generate automated performance & punctuality insights.
            </div>
          )}
        </div>
      </div>

      {/* Office QR Kiosk Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-indigo-600" /> Office Attendance Kiosk
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
                ×
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Employees can scan this dynamic QR code to check in. Code refreshes automatically for security.
            </p>

            {/* QR Image */}
            <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {qrToken ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrToken)}`}
                  alt="Attendance QR Code"
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl text-xs text-indigo-900 font-medium">
              <span>Auto-refreshing in:</span>
              <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg shadow-xs">
                {qrSecondsLeft}s
              </span>
            </div>

            <div className="text-left bg-gray-50 p-3 rounded-xl">
              <p className="text-[11px] text-gray-500 mb-1">Manual Token Code (Fallback):</p>
              <p className="text-[10px] font-mono text-gray-700 break-all select-all bg-white p-2 rounded border border-gray-200">
                {qrToken || "Generating..."}
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl text-sm transition-colors">
              Close Kiosk Screen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Attendance;
