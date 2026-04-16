import { Link } from "react-router-dom"

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-500">Access Denied 🚫</h1>
      <p className="mt-2">You don’t have permission to view this page.</p>

      <Link 
        to="/" 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Go Home
      </Link>
    </div>
  )
}