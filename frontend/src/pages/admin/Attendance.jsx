import { useState, useEffect } from "react";
import { getAllAttendance } from "../../services/attendanceService";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import { toast } from "react-toastify";
import { analyzeAttendance } from "../../services/AiService";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [aiAttendance, setAiAttendance] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllAttendance(page, 10);
        setAttendance(res.attendance);
        setTotalPages(res.totalPages)
      } catch (error) {
        console.error("error while loading attendance", error);
        setError("failed to load attendances");
        toast.error("failed to fetch attendance");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [page]);

  const handleAttendance = async (employeeId) => {
    setLoading(true);
    try {
      const res = await analyzeAttendance(employeeId);
      setAiAttendance(res);
      toast.success("attendance analyzed successfully");
    } catch (error) {
      console.error("error while analyzing attendance", error);
      toast.error("failed to analyze attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 ">

      {/* header */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold">All attendance</h2>

        {/* loading */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* error */}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {/* empty state */}
        {!loading && !error && attendance.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No attendance records found
          </div>
        )}

        {/* attendance grid */}
        {!loading && !error && attendance.length > 0 && (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {attendance.map((a) => (
              <AttendanceCard key={a._id} attendance={a} onAnalyze={handleAttendance} />
            ))}
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">
              prev
            </button>
            <span>page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className=" px-4 py-2 bg-gray-200 rounded disabled:opacity-50">
              next
            </button>
          </div>
          </>
        )}
      </div>

      {/* attendance report */}
      <div className="bg-white p-4 rounded shadow lg:w-85 h-150 overflow-y-auto shrink-8">
        <h3 className="font-semibold mb-2">AI insights</h3>
        {aiAttendance ? (
            <p className="text-sm whitespace-pre-wrap">{aiAttendance}</p>
        ) : (
            <p className="text-gray-400 text-sm">click analyze to see insights</p>
        )}
      </div>
    </div>
  );
}

export default Attendance;
