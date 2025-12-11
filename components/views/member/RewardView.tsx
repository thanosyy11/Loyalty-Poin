"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateVoucherCode, formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Gift, Ticket, Lock, CheckCircle, Clock } from "lucide-react";
import { Voucher } from "@/types";
import toast from "react-hot-toast";

// 1. Definisi Tipe Data (Strict TypeScript)
interface MemberProps {
  id: number;
  total_poin: number;
}

interface Reward {
  id: number;
  nama_hadiah: string;
  poin_butuh: number;
  nilai_voucher: number;
}

interface RewardViewProps {
  member: MemberProps;
  onUpdate: () => void;
}

export function RewardView({ member, onUpdate }: RewardViewProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "wallet">("catalog");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  // 2. Gunakan useCallback & Type Assertion
  const fetchRewards = useCallback(async () => {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("poin_butuh");

    if (data) {
      // Pastikan data sesuai interface Reward
      setRewards(data as Reward[]);
    }
  }, []);

  const fetchMyVouchers = useCallback(async () => {
    const { data } = await supabase
      .from("member_vouchers")
      .select("*, rewards(nama_hadiah, nilai_voucher)")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Casting data dari Supabase ke tipe Voucher[] kita
      // Note: Supabase return type agak kompleks jika ada relasi join,
      // jadi kita assert sebagai 'unknown' dulu lalu ke 'Voucher[]'
      setMyVouchers(data as unknown as Voucher[]);
    }
  }, [member.id]);

  // 3. useEffect dependencies
  useEffect(() => {
    fetchRewards();
    fetchMyVouchers();
  }, [fetchRewards, fetchMyVouchers]);

  // --- LOGIC KLAIM VOUCHER ---
  // --- LOGIC KLAIM VOUCHER ---
  const handleClaim = async (reward: Reward) => {
    if (member.total_poin < reward.poin_butuh) {
      toast.error("Poin tidak cukup!");
      return;
    }
    if (!confirm(`Tukar ${reward.poin_butuh} Poin?`)) return;

    setLoading(true);
    try {
      const code = generateVoucherCode();

      // Insert Voucher
      const { error: errVoucher } = await supabase
        .from("member_vouchers")
        .insert({
          member_id: member.id,
          reward_id: reward.id,
          code: code,
          status: "active"
        });
      if (errVoucher) throw errVoucher;

      // Update Poin Member
      const sisaPoin = member.total_poin - reward.poin_butuh;
      await supabase
        .from("members")
        .update({ total_poin: sisaPoin })
        .eq("id", member.id);

      // Catat Transaksi
      await supabase.from("transactions").insert({
        member_id: member.id,
        type: "redeem",
        amount: reward.poin_butuh,
        description: `Klaim Voucher: ${reward.nama_hadiah}`
      });

      toast.success("Berhasil Klaim! Cek tab 'Voucher Saya'");
      setActiveTab("wallet");
      await fetchMyVouchers();
      onUpdate();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Kesalahan tak dikenal";
      console.error(err);
      toast.error("Gagal klaim: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TAB NAVIGATION */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "catalog"
              ? "bg-slate-800 text-white shadow-md"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Gift size={16} /> Tukar Poin
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "wallet"
              ? "bg-slate-800 text-white shadow-md"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Ticket size={16} /> Voucher Saya
        </button>
      </div>

      {/* KONTEN: KATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
          {rewards.map((r) => {
            const isLocked = member.total_poin < r.poin_butuh;
            return (
              <div
                key={r.id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 opacity-70"
                    : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <h4
                      className={`font-bold text-base ${
                        isLocked ? "text-slate-500" : "text-slate-800"
                      }`}
                    >
                      {r.nama_hadiah}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Senilai {formatRupiah(r.nilai_voucher)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-black mb-2 ${
                        isLocked ? "text-slate-400" : "text-indigo-600"
                      }`}
                    >
                      {r.poin_butuh} Poin
                    </p>

                    <Button
                      size="sm"
                      disabled={isLocked || loading}
                      onClick={() => handleClaim(r)}
                      className={`px-4 py-2 text-xs h-auto rounded-lg font-bold ${
                        isLocked
                          ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed border-0"
                          : "bg-indigo-600 text-white shadow-indigo-200"
                      }`}
                    >
                      {isLocked ? (
                        <span className="flex items-center gap-1">
                          <Lock size={12} /> Kurang
                        </span>
                      ) : (
                        "Klaim"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KONTEN: DOMPET VOUCHER */}
      {activeTab === "wallet" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {myVouchers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Ticket size={24} />
              </div>
              <p className="text-slate-400 text-sm font-medium">
                Belum ada voucher aktif.
              </p>
            </div>
          )}

          {myVouchers.map((v) => {
            const isActive = v.status === "active";
            return (
              <div
                key={v.id}
                className={`relative bg-white border-2 p-5 rounded-2xl transition-all ${
                  isActive
                    ? "border-indigo-100 shadow-md"
                    : "border-slate-100 bg-slate-50 opacity-60 grayscale"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isActive ? "Siap Dipakai" : "Sudah Ditukar"}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">
                      {v.rewards?.nama_hadiah}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={10} /> Dibuat:{" "}
                      {new Date(v.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  {isActive ? (
                    <Ticket className="text-indigo-200" size={40} />
                  ) : (
                    <CheckCircle className="text-slate-300" size={40} />
                  )}
                </div>

                {isActive ? (
                  <div className="bg-slate-50 border-dashed border-2 border-indigo-200 rounded-xl p-4 text-center relative overflow-hidden">
                    <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase">
                      Tunjukkan Kode ke Kasir
                    </p>
                    <div className="text-2xl font-mono font-black text-slate-800 tracking-[0.2em]">
                      {v.code}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 font-bold strike-through">
                      VOUCHER SUDAH DIGUNAKAN
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
