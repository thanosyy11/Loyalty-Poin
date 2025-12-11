"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";


export default function HistoryView({ storeId }: { storeId: number | null }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if(!storeId) return;
      const { data } = await supabase
        .from("transactions")
        .select("*, members(nama)")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if(data) setHistory(data);
      setLoading(false);
    };
    fetchData();
  }, [storeId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
        <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Riwayat Transaksi Toko</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                        <th className="p-4">Waktu</th>
                        <th className="p-4">Member</th>
                        <th className="p-4">Keterangan</th>
                        <th className="p-4 text-right">Poin</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading && <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>}
                    {history.map(h => (
                        <tr key={h.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-500 whitespace-nowrap">{formatDate(h.created_at)}</td>
                            <td className="p-4 font-bold text-slate-700">{h.members?.nama}</td>
                            <td className="p-4 text-slate-600">{h.description}</td>
                            <td className="p-4 text-right">
                                <Badge variant={h.type==='earning'?'success':'neutral'}>
                                    {h.type==='earning'?'+':'-'}{h.amount}
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