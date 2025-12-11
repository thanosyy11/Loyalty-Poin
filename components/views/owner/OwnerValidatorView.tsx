"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Search, CheckCircle, XCircle, Gift, History, Store, Clock } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

// Mode Owner: Bisa validasi manual & Melihat riwayat semua toko
export function OwnerValidatorView() {
  const [code, setCode] = useState("");
  const [voucherData, setVoucherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State Riwayat
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // 1. FETCH RIWAYAT GLOBAL (SEMUA TOKO)
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    // Ambil voucher yang sudah USED, join dengan member, reward, dan toko penukar
    const { data } = await supabase
        .from("member_vouchers")
        .select("*, members(nama), rewards(nama_hadiah), stores!redeem_store_id(nama_toko)") 
        // Note: stores!redeem_store_id artinya kita ambil relasi ke kolom redeem_store_id
        .eq("status", "used")
        .order("used_at", { ascending: false })
        .limit(50);

    if(data) setHistory(data);
    setLoadingHistory(false);
  };

  // 2. CEK KODE (Validasi Manual Owner)
  const checkCode = async () => {
    if (!code) return;
    setLoading(true);
    setVoucherData(null);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("member_vouchers")
      .select("*, members(nama), rewards(nama_hadiah, nilai_voucher)")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !data) {
      setErrorMsg("Kode tidak ditemukan.");
    } else {
      setVoucherData(data);
    }
    setLoading(false);
  };

  // Owner hanya cek validitas, tidak melakukan "Redeem" (karena redeem harusnya di kasir fisik)
  // Tapi jika Owner ingin redeem manual, kita bisa tambahkan tombolnya. 
  // Di sini kita hanya menampilkan statusnya saja agar Owner tahu itu valid/tidak.

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
        
      {/* KOLOM KIRI: ALAT CEK VOUCHER */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search size={20} className="text-indigo-600"/> Cek Status Voucher
            </h3>
            <div className="flex gap-2">
                <input 
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="KODE UNIK"
                    className="flex-1 p-3 border-2 border-slate-200 rounded-xl font-mono font-bold text-center uppercase focus:border-indigo-500 outline-none"
                />
                <Button onClick={checkCode} isLoading={loading} className="w-14 flex justify-center"><Search/></Button>
            </div>

            {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex gap-2 border border-red-100">
                    <XCircle size={18}/> {errorMsg}
                </div>
            )}

            {voucherData && (
                <div className={`mt-4 p-4 rounded-xl border-2 ${voucherData.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${voucherData.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-500'}`}>
                            {voucherData.status}
                        </span>
                        {voucherData.status === 'active' && <CheckCircle className="text-green-600" size={20}/>}
                    </div>
                    <p className="text-lg font-bold text-slate-800">{voucherData.rewards?.nama_hadiah}</p>
                    <p className="text-xs text-slate-500 mt-1">Milik: <b>{voucherData.members?.nama}</b></p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">Dibuat: {formatDate(voucherData.created_at)}</p>
                </div>
            )}
        </div>
      </div>

      {/* KOLOM KANAN: RIWAYAT PENUKARAN GLOBAL */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <History size={20} className="text-orange-500"/> Riwayat Penukaran (Global)
                </h3>
                <p className="text-xs text-slate-400 mt-1">50 Voucher terakhir yang digunakan di seluruh cabang.</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                        <tr>
                            <th className="p-4">Waktu</th>
                            <th className="p-4">Hadiah</th>
                            <th className="p-4">Member</th>
                            <th className="p-4">Lokasi Redeem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loadingHistory && <tr><td colSpan={4} className="p-6 text-center">Memuat data...</td></tr>}
                        {!loadingHistory && history.map((h) => (
                            <tr key={h.id} className="hover:bg-slate-50">
                                <td className="p-4 text-slate-500 flex items-center gap-2">
                                    <Clock size={14}/> {formatDate(h.used_at)}
                                </td>
                                <td className="p-4 font-bold text-slate-700">
                                    {h.rewards?.nama_hadiah}
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{h.code}</div>
                                </td>
                                <td className="p-4 text-slate-600">{h.members?.nama}</td>
                                <td className="p-4">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                        <Store size={12}/> {h.stores?.nama_toko || "Unknown"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

    </div>
  );
}