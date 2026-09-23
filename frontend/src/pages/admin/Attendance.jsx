import { useState, useEffect } from "react";
import { getAllAttendance, getQRToken, getOfficeLocation, updateOfficeLocation } from "../../services/attendanceService";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import { toast } from "react-toastify";
import { analyzeAttendance } from "../../services/AiService";
import { QrCode, RefreshCw, Sparkles, MapPin, Zap, Navigation, Crosshair, CheckCircle2 } from "lucide-react";

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
        setLocData(prev => ({
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowLocModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center gap-2 border border-slate-200/90 shadow-2xs transition-all text-xs">
            <MapPin className="w-4 h-4 text-indigo-600" /> Office Geo-Fence Settings
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm">
            <QrCode className="w-4 h-4" /> Launch Live Office QR Kiosk
          </button>
        </div>
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

      {/* Office Geo-Fence Settings Modal */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Office Geo-Fence Settings</h3>
                  <p className="text-[11px] text-slate-400">Configure coordinates & allowed check-in radius</p>
                </div>
              </div>
              <button
                onClick={() => setShowLocModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ×
              </button>
            </div>

            {/* Auto GPS Detection Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detectingGps}
              className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-indigo-200/80 transition-all shadow-2xs">
              <Crosshair className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
              {detectingGps ? "Detecting GPS location..." : "📍 Set to My Current GPS Location"}
            </button>

            <form onSubmit={handleSaveLocation} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={locData.latitude}
                    onChange={(e) => setLocData({ ...locData, latitude: e.target.value })}
                    placeholder="e.g. 21.251382"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={locData.longitude}
                    onChange={(e) => setLocData({ ...locData, longitude: e.target.value })}
                    placeholder="e.g. 81.629639"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Allowed Radius (Meters)</label>
                <div className="flex gap-2">
                  {[200, 500, 1000, 2000].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLocData({ ...locData, radiusMeters: r })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        Number(locData.radiusMeters) === r
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}>
                      {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Office / Branch Name</label>
                <input
                  type="text"
                  value={locData.name}
                  onChange={(e) => setLocData({ ...locData, name: e.target.value })}
                  placeholder="e.g. Headquarters / Main Office"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Physical Address (Optional)</label>
                <input
                  type="text"
                  value={locData.address}
                  onChange={(e) => setLocData({ ...locData, address: e.target.value })}
                  placeholder="e.g. Floor 4, Cyber City"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={locLoading}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5">
                  {locLoading ? "Saving..." : "Save Office Location"}
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
