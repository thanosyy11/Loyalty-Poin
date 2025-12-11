"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Trash2, AlertTriangle, Gift, Percent, Save } from "lucide-react";

export function OwnerSettingsView() {
  const [poinDivisor, setPoinDivisor] = useState("25000");
  const [newReward, setNewReward] = useState({ nama: "", poin: "", value: "" });
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data: sett } = await supabase.from("settings").select("value").eq("key", "poin_divisor").single();
      if (sett) setPoinDivisor(sett.value);
      
      const { data: r } = await supabase.from("rewards").select("*").order("poin_butuh");
      if (r) setRewards(r);
    };
    fetchData();
  }, []);

  // 1. SIMPAN ATURAN POIN
  const saveRule = async () => {
    setLoading(true);
    await supabase.from("settings").upsert({ key: "poin_divisor", value: poinDivisor });
    setLoading(false);
    alert("✅ Aturan Poin Disimpan!");
  };

  // 2. TAMBAH REWARD
  const addReward = async () => {
    if (!newReward.nama || !newReward.poin) return alert("Isi lengkap!");
    await supabase.from("rewards").insert([{
      nama_hadiah: newReward.nama,
      poin_butuh: parseInt(newReward.poin),
      nilai_voucher: parseInt(newReward.value)
    }]);
    setNewReward({ nama: "", poin: "", value: "" });
    // Refresh rewards
    const { data } = await supabase.from("rewards").select("*").order("poin_butuh");
    if(data) setRewards(data);
  };

  const deleteReward = async (id: number) => {
    if(confirm("Hapus hadiah ini?")) {
        await supabase.from("rewards").delete().eq("id", id);
        const { data } = await supabase.from("rewards").select("*").order("poin_butuh");
        if(data) setRewards(data);
    }
  }

  // 3. RESET DATA (DANGER ZONE)
  const handleResetData = async () => {
    const code = prompt("KETIK 'RESET' UNTUK MENGHAPUS SEMUA DATA MEMBER & TRANSAKSI:");
    if (code !== "RESET") return alert("Batal.");
    
    setResetLoading(true);
    const { error } = await supabase.rpc("reset_app_data");
    if (error) alert("Gagal: " + error.message);
    else alert("⚠️ SEMUA DATA MEMBER & TRANSAKSI TELAH DIHAPUS BERSIH!");
    setResetLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
      
      {/* KOLOM KIRI: ATURAN POIN & RESET */}
      <div className="space-y-8">
        <Card>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Percent className="text-indigo-600"/> Konversi Poin
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-500 font-bold">1 POIN = Belanja Rp</span>
              <input
                className="border-2 border-slate-200 p-2 rounded-lg font-bold w-32 text-center focus:border-indigo-500 outline-none"
                value={poinDivisor}
                onChange={(e) => setPoinDivisor(e.target.value)}
              />
            </div>
            <Button onClick={saveRule} isLoading={loading} icon={<Save size={18}/>} className="w-full">
                Simpan Aturan
            </Button>
        </Card>

        {/* DANGER ZONE */}
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                <AlertTriangle/> Danger Zone
            </h3>
            <p className="text-xs text-red-600 mb-4">
                Menghapus semua data Member, Transaksi, dan Voucher. Data Toko & Akun Kasir <b>TIDAK</b> terhapus.
            </p>
            <Button variant="danger" onClick={handleResetData} isLoading={resetLoading} className="w-full">
                RESET DATABASE (DEV ONLY)
            </Button>
        </div>
      </div>

      {/* KOLOM KANAN: DAFTAR REWARD */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Gift className="text-purple-600"/> Katalog Hadiah
        </h3>
        
        {/* Form Tambah */}
        <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
            <Input label="Nama Hadiah" value={newReward.nama} onChange={(e: any) => setNewReward({...newReward, nama: e.target.value})} placeholder="Cth: Payung Cantik"/>
            <div className="flex gap-2">
                <Input label="Poin Butuh" value={newReward.poin} onChange={(e: any) => setNewReward({...newReward, poin: e.target.value})} placeholder="50"/>
                <Input label="Nilai (Rp)" value={newReward.value} onChange={(e: any) => setNewReward({...newReward, value: e.target.value})} placeholder="20000"/>
            </div>
            <Button onClick={addReward} size="sm" className="w-full mt-2">Tambah Hadiah</Button>
        </div>

        {/* List Reward */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {rewards.map((r) => (
                <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                    <div>
                        <p className="font-bold text-sm text-slate-700">{r.nama_hadiah}</p>
                        <p className="text-xs text-slate-400">{r.poin_butuh} Poin • Rp {r.nilai_voucher}</p>
                    </div>
                    <button onClick={() => deleteReward(r.id)} className="p-2 text-slate-300 hover:text-red-500 transition">
                        <Trash2 size={16}/>
                    </button>
                </div>
            ))}
        </div>
      </Card>
    </div>
  );
}