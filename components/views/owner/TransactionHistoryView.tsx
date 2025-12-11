"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Store, Calendar, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function TransactionHistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*, members(nama, no_hp), stores(nama_toko)")
        .order("created_at", { ascending: false })
        .limit(300); // Ambil lebih banyak
      if (data) setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // Logic Search
  const filtered = history.filter(h => 
    (h.members?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Store className="text-indigo-500"/> Riwayat Transaksi Global
            </h2>
            <p className="text-xs text-slate-400 mt-1">Semua aktivitas dari seluruh cabang</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            <input 
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Cari Transaksi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Waktu</th>
                <th className="p-4">Toko</th>
                <th className="p-4">Member</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 text-right">Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>}
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500 whitespace-nowrap text-xs">{formatDate(h.created_at)}</td>
                  <td className="p-4 font-bold text-slate-700 text-xs uppercase">{h.stores?.nama_toko || "Pusat"}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-sm">{h.members?.nama}</p>
                    <p className="text-xs text-slate-400">{h.members?.no_hp}</p>
                  </td>
                  <td className="p-4 text-slate-600">{h.description}</td>
                  <td className="p-4 text-right">
                    <Badge variant={h.type === 'earning' ? 'success' : 'error'}>
                      {h.type === 'earning' ? '+' : '-'}{h.amount}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}