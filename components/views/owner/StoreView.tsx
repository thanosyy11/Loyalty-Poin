"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Store, Plus, Trash2, MapPin, Tag, Loader2 } from "lucide-react";

export function StoreView() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ nama: "", alamat: "", kode: "" });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase.from("stores").select("*").order("id");
    if (data) setStores(data);
    setLoading(false);
  };

  const handleAddStore = async () => {
    // Validasi Input
    if (!form.nama || !form.kode) return alert("Nama dan Kode Toko wajib diisi!");
    
    // Validasi Kode Toko (Harus Uppercase & Singkat, misal: BP01)
    const storeCode = form.kode.toUpperCase().replace(/\s/g, "");
    if (storeCode.length < 3 || storeCode.length > 5) {
        return alert("Kode toko harus 3-5 huruf/angka (Contoh: BP01)");
    }

    setSubmitLoading(true);
    const { error } = await supabase.from("stores").insert([{
        nama_toko: form.nama,
        alamat: form.alamat,
        kode_toko: storeCode
    }]);

    if (error) {
        alert("Gagal: " + error.message + " (Mungkin Kode Toko sudah dipakai?)");
    } else {
        alert("✅ Toko Berhasil Ditambahkan!");
        setForm({ nama: "", alamat: "", kode: "" });
        fetchStores();
    }
    setSubmitLoading(false);
  };

  const handleDelete = async (id: number) => {
    if(confirm("⚠️ HAPUS TOKO INI? \n\nSemua data Kasir, Member, dan Transaksi yang terkait dengan toko ini mungkin akan ikut terhapus atau error. Pastikan toko sudah tidak beroperasi.")) {
        const { error } = await supabase.from("stores").delete().eq("id", id);
        if(error) alert("Gagal hapus: " + error.message);
        else fetchStores();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      
      {/* KOLOM KIRI: FORM TAMBAH TOKO */}
      <div className="lg:col-span-1">
        <Card>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Store className="text-indigo-600"/> Tambah Cabang
            </h3>
            
            <div className="space-y-1">
                <Input 
                    label="Nama Toko" 
                    placeholder="Contoh: Bolu Cabang Utara" 
                    value={form.nama} 
                    onChange={(e:any) => setForm({...form, nama: e.target.value})}
                />
                
                <Input 
                    label="Kode Toko (Prefix Voucher)" 
                    placeholder="Contoh: BCU01" 
                    value={form.kode} 
                    onChange={(e:any) => setForm({...form, kode: e.target.value.toUpperCase()})}
                    maxLength={5}
                />
                <div className="bg-indigo-50 p-3 rounded-lg text-xs text-indigo-700 mb-4 -mt-2">
                    Kode ini akan menjadi awalan voucher.<br/>
                    Contoh: <b>{form.kode || "BCU01"}-X8A9</b>
                </div>
                
                <Input 
                    label="Alamat Lengkap" 
                    placeholder="Jl. Raya..." 
                    value={form.alamat} 
                    onChange={(e:any) => setForm({...form, alamat: e.target.value})}
                />
                
                <Button 
                    onClick={handleAddStore} 
                    isLoading={submitLoading}
                    className="w-full mt-4" 
                    icon={<Plus size={18}/>}
                >
                    Simpan Toko
                </Button>
            </div>
        </Card>
      </div>

      {/* KOLOM KANAN: DAFTAR TOKO */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            Daftar Cabang Aktif 
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{stores.length}</span>
        </h3>
        
        {loading ? (
            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-400"/></div>
        ) : (
            <div className="grid gap-3">
                {stores.map((s) => (
                    <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-200 transition group">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition">{s.nama_toko}</h4>
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1" title="Kode Toko">
                                    <Tag size={10}/> {s.kode_toko}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                                <MapPin size={14}/> {s.alamat || "Tidak ada alamat"}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleDelete(s.id)} 
                                className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Hapus Toko"
                            >
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    </div>
                ))}
                
                {stores.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                        Belum ada toko cabang. Tambahkan di sebelah kiri.
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}