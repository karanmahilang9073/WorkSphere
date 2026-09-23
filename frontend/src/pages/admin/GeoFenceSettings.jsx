import React, { useState, useEffect } from 'react'
import { getOfficeLocation, updateOfficeLocation } from '../../services/attendanceService'
import { toast } from 'react-toastify'
import {
    MapPin,
    Crosshair,
    Save,
    ShieldCheck,
    Building2,
    Compass,
    Radio,
    Sparkles,
    CheckCircle2
} from 'lucide-react'

function GeoFenceSettings() {
    const [locData, setLocData] = useState({
        name: "Main Office",
        latitude: "",
        longitude: "",
        radiusMeters: 500,
        address: "Corporate Office"
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [detectingGps, setDetectingGps] = useState(false)

    const fetchLocation = async () => {
        setLoading(true)
        try {
            const data = await getOfficeLocation()
            if (data) {
                setLocData({
                    name: data.name || "Main Office",
                    latitude: data.latitude !== undefined ? data.latitude : "",
                    longitude: data.longitude !== undefined ? data.longitude : "",
                    radiusMeters: data.radiusMeters || 500,
                    address: data.address || "Corporate Office"
                })
            }
        } catch (err) {
            console.error("Failed to load office location", err)
            toast.error("Failed to load office geo-fence settings")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLocation()
    }, [])

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }
        setDetectingGps(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocData(prev => ({
                    ...prev,
                    latitude: Number(pos.coords.latitude.toFixed(6)),
                    longitude: Number(pos.coords.longitude.toFixed(6))
                }))
                setDetectingGps(false)
                toast.success("Current GPS coordinates detected!")
            },
            (err) => {
                console.error("GPS error", err)
                setDetectingGps(false)
                toast.error("Failed to detect GPS location. Please allow browser location access.")
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (locData.latitude === "" || locData.longitude === "") {
            toast.error("Latitude and Longitude are required")
            return
        }
        setSaving(true)
        try {
            await updateOfficeLocation(locData)
            toast.success("Office Geo-Fence settings saved successfully!")
        } catch (err) {
            console.error("Failed to update office location", err)
            toast.error(err?.message || "Failed to save office location")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                Office Geo-Fence Settings
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Fence
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Set physical office coordinates and allowed radius for employee check-ins
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Strict Verification</span>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/90">
                    <Compass className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-xs">Loading geo-fence configuration...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Coordinates & Boundaries</h3>
                                <p className="text-xs text-slate-500">Configure where employees are permitted to punch in</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={detectingGps}
                                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-indigo-200/80 transition-all shadow-2xs">
                                <Crosshair className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                                {detectingGps ? "Detecting..." : "📍 Set to My Current GPS"}
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Latitude *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={locData.latitude}
                                        onChange={(e) => setLocData({ ...locData, latitude: e.target.value })}
                                        placeholder="e.g. 21.251382"
                                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Longitude *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={locData.longitude}
                                        onChange={(e) => setLocData({ ...locData, longitude: e.target.value })}
                                        placeholder="e.g. 81.629639"
                                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700">
                                    Allowed Office Radius (Meters)
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[200, 500, 1000, 2000].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setLocData({ ...locData, radiusMeters: r })}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                Number(locData.radiusMeters) === r
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}>
                                            {r >= 1000 ? `${r / 1000} km` : `${r} m`}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Employees checking in further than {locData.radiusMeters}m from this location will be guided to use QR scan.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Office / Branch Name</label>
                                <input
                                    type="text"
                                    value={locData.name}
                                    onChange={(e) => setLocData({ ...locData, name: e.target.value })}
                                    placeholder="e.g. Headquarters / Tech Hub"
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Physical Address / Notes</label>
                                <input
                                    type="text"
                                    value={locData.address}
                                    onChange={(e) => setLocData({ ...locData, address: e.target.value })}
                                    placeholder="e.g. Building 4, Cyber Gateway"
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50">
                                    <Save className="w-4 h-4" />
                                    {saving ? "Saving Changes..." : "Save Geo-Fence Settings"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Side Info & Live Preview */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Active Broadcast
                            </div>

                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Office</span>
                                <h3 className="text-base font-bold text-white mt-0.5">{locData.name || "Main Office"}</h3>
                                <p className="text-xs text-indigo-200/80 mt-0.5">{locData.address || "Corporate Office"}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Latitude:</span>
                                    <span className="font-mono font-semibold">{locData.latitude || "--"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Longitude:</span>
                                    <span className="font-mono font-semibold">{locData.longitude || "--"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Allowed Radius:</span>
                                    <span className="font-bold text-emerald-400">{locData.radiusMeters} meters</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2 text-xs text-slate-600">
                            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> How It Works
                            </h4>
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                When an employee clicks <strong>Check In</strong>, their browser GPS coordinates are verified against this location using the Haversine distance formula.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GeoFenceSettings

