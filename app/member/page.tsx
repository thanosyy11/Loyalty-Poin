"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, LogOut, User, Wallet } from "lucide-react";
import { RewardView } from "@/components/views/member/RewardView";
import { MEMBER_SESSION_KEY } from "@/lib/constants";
import toast from "react-hot-toast"; // Import Toast

// Definisi Tipe Data
interface MemberData {
  id: number;
  nama: string;
  total_poin: number;
  stores?: { nama_toko: string };
}

export default function MemberPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Member
  const fetchMember = useCallback(
    async (id: number) => {
      try {
        const { data, error } = await supabase
          .from("members")
          .select("*, stores(nama_toko)")
          .eq("id", id)
          .single();

        if (error || !data) {
          sessionStorage.clear();
          router.replace("/");
        } else {
          setMember(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // 2. Cek Session
  useEffect(() => {
    const sessionStr = sessionStorage.getItem(MEMBER_SESSION_KEY);
    if (!sessionStr) {
      router.replace("/");
    } else {
      try {
        const session = JSON.parse(sessionStr);
        fetchMember(session.id);
      } catch (e) {
        console.error("Invalid session data:", e);
        sessionStorage.clear();
        router.replace("/");
      }
    }
  }, [fetchMember, router]);

  // 3. LOGOUT HANDLER (Pakai Toast)
  const handleLogout = async () => {
    toast.success("Sampai jumpa lagi!");
    await new Promise((r) => setTimeout(r, 1000));
    sessionStorage.clear();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen bg-slate-100 font-poppins flex justify-center">
      <div className="w-full max-w-[480px] bg-slate-50 min-h-screen shadow-2xl flex flex-col relative">
        {/* HEADER */}
        <div className="bg-slate-900 text-white pt-10 pb-20 px-6 rounded-b-[2.5rem] shadow-lg relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white shadow-md">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Member • {member.stores?.nama_toko || "Pusat"}
                </p>
                <h1 className="text-lg sm:text-xl font-bold">{member.nama}</h1>
              </div>
            </div>

            {/* BUTTON LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-slate-800 p-2.5 rounded-xl hover:bg-red-600 hover:text-white text-slate-400 transition border border-slate-700"
              title="Keluar Aplikasi"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-5 -mt-14 pb-10 z-20">
          {/* KARTU SALDO */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mb-6 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Wallet size={14} /> Poin saat ini:
              </p>
              <h2 className="text-6xl font-black text-slate-800 tracking-tighter">
                {member.total_poin}
              </h2>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-50 rounded-full opacity-50" />
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-indigo-50 rounded-full opacity-50" />
          </div>

          <RewardView member={member} onUpdate={() => fetchMember(member.id)} />
        </div>
      </div>
    </div>
  );
}
