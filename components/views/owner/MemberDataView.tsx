"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { hashData } from "@/lib/security"; // Import Hash
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, Smartphone, Lock, Edit, Trash2, X, Save, Store } from "lucide-react";

export function MemberDataView() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // State Edit
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nama: "", hp: "", newPin: "" });

  // Fetch Data
  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*, stores(nama_toko)")
      .order("created_at", { ascending: false });
    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  // Handle Edit
  const handleEdit = (m: any) => {
    setEditingMember(m);
    setEditForm({ nama: m.nama, hp: m.no_hp, newPin: "" });
  };

  const saveEdit = async () => {
    if (!editingMember) return;
    const updates: any = { nama: editForm.nama, no_hp: editForm.hp };
    
    // Jika PIN diisi, hash dulu baru update
    if (editForm.newPin) {
        if (editForm.newPin.length < 4) return alert("PIN minimal 4 angka!");
        updates.pin = await hashData(editForm.newPin);
    }

    const { error } = await supabase.from("members").update(updates).eq("id", editingMember.id);
    
    if (error) alert("Gagal: " + error.message);
    else {
        alert("✅ Data Member Diupdate!");
        setEditingMember(null);
        fetchMembers();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus member ini permanen?")) {
        await supabase.from("members").delete().eq("id", id);
        fetchMembers();
    }
  };

  const filteredMembers = members.filter((m) =>
    (m.nama || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.no_hp || "").includes(search)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800">Database Member ({filteredMembers.length})</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari Nama / No HP..."
            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">Kontak</th>
              <th className="p-4 text-right">Poin</th>
              <th className="p-4">Asal Toko</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-700">{m.nama}</td>
                  <td className="p-4 text-slate-500 flex items-center gap-2"><Smartphone size={14}/> {m.no_hp}</td>
                  <td className="p-4 text-right font-black text-indigo-600">{m.total_poin}</td>
                  <td className="p-4 text-xs text-slate-400 uppercase"><span className="flex items-center gap-1"><Store size={12}/> {m.stores?.nama_toko || "Unknown"}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(m)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Edit Member</h3>
                    <button onClick={()=>setEditingMember(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="space-y-3">
                    <Input label="Nama" value={editForm.nama} onChange={(e:any)=>setEditForm({...editForm, nama: e.target.value})}/>
                    <Input label="No HP" value={editForm.hp} onChange={(e:any)=>setEditForm({...editForm, hp: e.target.value})}/>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <p className="text-xs text-orange-700 font-bold mb-2 flex items-center gap-1"><Lock size={12}/> Reset PIN (Opsional)</p>
                        <Input placeholder="Masukkan PIN Baru" value={editForm.newPin} onChange={(e:any)=>setEditForm({...editForm, newPin: e.target.value})}/>
                    </div>
                    <Button onClick={saveEdit} className="w-full mt-2">Simpan Perubahan</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}