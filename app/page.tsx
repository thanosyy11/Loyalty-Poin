"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { verifyData } from "@/lib/security";
import { MEMBER_SESSION_KEY, APP_SESSION_KEY } from "@/lib/constants";
import { Loader2, Smartphone, Lock, Store, ArrowRight, User, UserCog } from "lucide-react";
import toast from "react-hot-toast";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"member" | "staff">("member");
  const [loading, setLoading] = useState(false);
  
  // State Form (Digabung agar praktis)
  const [form, setForm] = useState({ identifier: "", password: "" }); // identifier = HP/Username, password = PIN/Password

  // Reset semua sesi saat masuk halaman utama
  useEffect(() => {
    sessionStorage.removeItem(MEMBER_SESSION_KEY);
    localStorage.removeItem(APP_SESSION_KEY);
  }, []);

  // Handler Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMode === "member") {
        // --- LOGIKA LOGIN MEMBER ---
        const { data, error } = await supabase
          .from("members")
          .select("id, nama, no_hp, pin, store_id")
          .eq("no_hp", form.identifier)
          .single();

        if (error || !data) {
          toast.error("Nomor HP tidak terdaftar.");
          setLoading(false);
          return;
        }

        // Cek PIN (Hash) + Fallback PIN Lama
        let isMatch = await verifyData(form.password, data.pin);
        if (!isMatch && data.pin === form.password) isMatch = true;

        if (!isMatch) {
          toast.error("PIN Salah!");
          setLoading(false);
          return;
        }

        // Sukses Member
        const sessionData = { id: data.id, nama: data.nama, storeId: data.store_id };
        sessionStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(sessionData));
        toast.success(`Halo, ${data.nama}!`);
        setTimeout(() => router.replace("/member"), 500);

      } else {
        // --- LOGIKA LOGIN STAFF (KASIR/OWNER) ---
        const { data, error } = await supabase
          .from("cashiers")
          .select("*, stores(nama_toko)")
          .eq("username", form.identifier)
          .eq("is_active", true)
          .single();

        if (error || !data) {
          toast.error("Username tidak ditemukan.");
          setLoading(false);
          return;
        }

        // Cek Password (Hash) + Fallback Password Lama
        let isMatch = await verifyData(form.password, data.password);
        if (!isMatch && data.password === form.password) isMatch = true;

        if (!isMatch) {
          toast.error("Password Salah!");
          setLoading(false);
          return;
        }

        // Sukses Staff
        const sessionData = {
          id: data.id,
          username: data.username,
          role: data.role,
          storeId: data.store_id,
          storeName: data.stores?.nama_toko || "Pusat",
          loginTime: Date.now(),
        };
        localStorage.setItem(APP_SESSION_KEY, JSON.stringify(sessionData));
        
        toast.success(`Welcome, ${data.username}!`);
        setTimeout(() => {
            if (data.role === "admin") router.push("/owner");
            else router.push("/kasir");
        }, 500);
      }

    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-poppins text-slate-800">
      
      {/* Brand Header */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 inline-flex mb-4">
            <Store className="text-indigo-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Bolu Kukus Loyalty</h1>
        <p className="text-slate-500 text-sm mt-1">Kesetiaan pelanggan adalah rahasia di balik rasa bahagia.</p>
      </div>

      {/* Card Login */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* TAB TOGGLE (Switch Member/Staff) */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => { setLoginMode("member"); setForm({identifier:"", password:""}); }}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${loginMode === "member" ? "bg-white text-indigo-600 border-b-2 border-indigo-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
            >
                <User size={18}/> Member Area
            </button>
            <button 
                onClick={() => { setLoginMode("staff"); setForm({identifier:"", password:""}); }}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${loginMode === "staff" ? "bg-white text-purple-600 border-b-2 border-purple-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
            >
                <UserCog size={18}/> Staff Portal
            </button>
        </div>

        <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Input Identifier (HP atau Username) */}
            <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 ml-1">
                    {loginMode === "member" ? "Nomor HP" : "Username"}
                </label>
                <div className="relative group">
                    <div className="absolute left-4 top-3.5 text-slate-400 transition-colors">
                        {loginMode === "member" ? <Smartphone size={20}/> : <User size={20}/>}
                    </div>
                    <input 
                        type={loginMode === "member" ? "tel" : "text"}
                        required 
                        className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                        placeholder={loginMode === "member" ? "08..." : "user_kasir"}
                        value={form.identifier}
                        onChange={e => setForm({...form, identifier: e.target.value})}
                    />
                </div>
            </div>

            {/* Input Password (PIN atau Password) */}
            <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 ml-1">
                    {loginMode === "member" ? "PIN" : "password"}
                </label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20}/>
                    <input 
                        type="password" 
                        required 
                        maxLength={loginMode === "member" ? 6 : undefined}
                        className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                        placeholder="••••"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                    />
                </div>
            </div>
            
            {/* Button Submit */}
            <button 
                type="submit"
                disabled={loading}
                className={`w-full text-white py-4 rounded-xl font-bold text-base transition shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    loginMode === "member" 
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" 
                        : "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                }`}
            >
                {loading ? (
                    <><Loader2 className="animate-spin"/> Memproses...</>
                ) : (
                    <>Masuk Sekarang <ArrowRight size={18} /></>
                )}
            </button>
            </form>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400 font-medium">
        {loginMode === "member" ? "Lupa PIN? Hubungi kasir." : "Hanya untuk Staff."}
      </p>
    </div>
  );
}