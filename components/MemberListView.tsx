"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { hashData } from "@/lib/security"; // Untuk Enkripsi PIN Baru
import { Search, Smartphone, Edit, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";


export default function MemberListView({ storeId }: { storeId: number | null }) {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State Modal Edit
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nama: "", hp: "", newPin: "" });

  const fetchData = async () => {
    if(!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*, stores(nama_toko)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [storeId]);

  // LOGIC EDIT MEMBER
  const handleEdit = (m: any) => {
    setEditingMember(m);
    setEditForm({ nama: m.nama, hp: m.no_hp, newPin: "" }); // PIN kosong default
  };

  const handleSaveEdit = async () => {
    if(!editingMember) return;
    
    const updates: any = {
        nama: editForm.nama,
        no_hp: editForm.hp
    };

    // Jika PIN diisi, hash dulu lalu update
    if(editForm.newPin) {
        if(editForm.newPin.length < 4) return alert("PIN minimal 4 angka");
        updates.pin = await hashData(editForm.newPin);
    }

    const { error } = await supabase.from("members").update(updates).eq("id", editingMember.id);
    
    if(error) alert("Gagal update: "+error.message);
    else {
        alert("✅ Data Member Diupdate!");
        setEditingMember(null);
        fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if(confirm("Yakin hapus member ini? Poin & Riwayat akan hilang permanen.")) {
        await supabase.from("members").delete().eq("id", id);
        fetchData();
    }
  };

  const filteredMembers = members.filter((m) =>
    m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.no_hp.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800">Database Pelanggan Lokal</h2>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
            <input 
                className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Cari Nama / HP..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">No HP</th>
              <th className="p-4">Poin</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700">{m.nama}</td>
                <td className="p-4 text-slate-500 flex items-center gap-2"><Smartphone size={14}/> {m.no_hp}</td>
                <td className="p-4 font-black text-indigo-600">{m.total_poin}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={()=>handleEdit(m)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit size={16}/></button>
                    <button onClick={()=>handleDelete(m.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT MEMBER */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Edit Member</h3>
                    <button onClick={()=>setEditingMember(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="space-y-2">
                    <Input label="Nama" value={editForm.nama} onChange={(e:any)=>setEditForm({...editForm, nama: e.target.value})}/>
                    <Input label="No HP" value={editForm.hp} onChange={(e:any)=>setEditForm({...editForm, hp: e.target.value})}/>
                    <hr className="my-2"/>
                    <Input label="Reset PIN Baru (Opsional)" placeholder="Isi untuk ganti PIN" value={editForm.newPin} onChange={(e:any)=>setEditForm({...editForm, newPin: e.target.value})}/>
                    
                    <Button onClick={handleSaveEdit} className="w-full mt-2" icon={<Save size={18}/>}>Simpan Perubahan</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}