"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Search, CheckCircle, XCircle, Gift, History, Clock } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Voucher } from "@/types";

// ✅ Interface utama
interface VoucherWithDetails extends Voucher {
  members: { nama: string };
  rewards: { nama_hadiah: string; nilai_voucher: number };
}

// ✅ Tipe lokal untuk riwayat
interface LocalVoucherHistory {
  id: number;
  code: string;
  used_at: string;
  members?: { nama: string };
  rewards?: { nama_hadiah: string };
}

export function ValidatorView() {
  const { session } = useAuth();
  const [code, setCode] = useState("");
  const [voucherData, setVoucherData] = useState<VoucherWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [localHistory, setLocalHistory] = useState<LocalVoucherHistory[]>([]);

  // ✅ Fetch local history dengan dependency [session]
  const fetchLocalHistory = useCallback(async () => {
    if (!session?.storeId) return;
    const { data, error } = await supabase
      .from("member_vouchers")
      .select("*, members(nama), rewards(nama_hadiah)")
      .eq("redeem_store_id", session.storeId)
      .eq("status", "used")
      .order("used_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Gagal mengambil riwayat:", error.message);
      return;
    }

    if (data) setLocalHistory(data as LocalVoucherHistory[]);
  }, [session]);

useEffect(() => {
  (async () => {
    await fetchLocalHistory();
  })();
}, [fetchLocalHistory]);

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
      setErrorMsg("Kode voucher tidak ditemukan!");
    } else if (data.status !== "active") {
      setErrorMsg(`Voucher tidak valid! Status: ${data.status.toUpperCase()}`);
    } else {
      setVoucherData(data as unknown as VoucherWithDetails);
    }

    setLoading(false);
  };

  const processRedeem = async () => {
    if (!voucherData || !session?.storeId) return;
    setRedeemLoading(true);

    const { error } = await supabase
      .from("member_vouchers")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        redeem_store_id: session.storeId,
      })
      .eq("id", voucherData.id);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("✅ VOUCHER BERHASIL DIGUNAKAN!");
      setVoucherData(null);
      setCode("");
      await fetchLocalHistory(); // Refresh
    }

    setRedeemLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-8 animate-in fade-in">
      {/* === FORM VALIDASI === */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Gift className="text-purple-600" /> Validasi Voucher
        </h2>

        {/* INPUT */}
        <div className="flex gap-2 items-end mb-6">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-2">
              KODE VOUCHER MEMBER
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Cth: VOU-8X2A"
              className="w-full p-4 text-center font-mono text-xl font-bold border-2 border-slate-200 rounded-xl uppercase focus:border-purple-500 outline-none transition-colors"
            />
          </div>
          <Button
            onClick={checkCode}
            isLoading={loading}
            className="h-16 w-16 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center"
          >
            <Search size={28} />
          </Button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 mb-4 animate-in shake">
            <XCircle size={24} />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {voucherData && (
          <div className="border-2 border-green-100 bg-green-50 rounded-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Voucher Valid!</h3>

            <div className="my-4 bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                Hadiah
              </p>
              <p className="text-xl font-bold text-green-600">
                {voucherData.rewards.nama_hadiah}
              </p>
              <p className="text-sm text-slate-500">
                Nilai: {formatRupiah(voucherData.rewards.nilai_voucher)}
              </p>
            </div>

            <div className="text-sm text-slate-500 mb-6">
              Milik Member: <b>{voucherData.members.nama}</b>
            </div>

            <Button
              onClick={processRedeem}
              isLoading={redeemLoading}
              className="w-full bg-green-600 hover:bg-green-700 shadow-green-200 py-4"
            >
              Gunakan Voucher Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* === RIWAYAT PENUKARAN === */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-lg mx-auto w-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
            <History size={16} /> Riwayat Penukaran (Toko Ini)
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {localHistory.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">
              Belum ada data.
            </p>
          ) : (
            localHistory.map((h) => (
              <div
                key={h.id}
                className="p-4 flex justify-between items-center hover:bg-slate-50"
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {h.rewards?.nama_hadiah}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Member: {h.members?.nama}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-mono">{h.code}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Clock size={10} /> {formatDate(h.used_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
