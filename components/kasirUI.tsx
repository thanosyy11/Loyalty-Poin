// Lokasi: src/app/kasir/components/KasirUI.tsx
import { ChevronRight } from "lucide-react";

// 1. Komponen Input (Untuk Register & Setting)
export function InputGroup({label, type="text", ...props}: any) {
    return (
        <div className="mb-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
            <input type={type} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" {...props} />
        </div>
    )
}

// 2. Komponen Kartu Statistik (Untuk Dashboard)
export function StatCard({title, value, icon, bg}: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
    )
}

// 3. Komponen Menu Sidebar (Untuk Halaman Utama)
export function MenuItem({ label, active, onClick, icon }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
      {icon} 
      <span>{label}</span> 
      {active && <ChevronRight size={16} className="ml-auto opacity-50"/>}
    </button>
  );
}