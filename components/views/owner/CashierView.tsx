"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";
import { Store } from "@/types";

// ✅ Tipe Cashier yang eksplisit
interface Cashier {
  id: number;
  username: string;
  password: string;
  role: string;
  store_id: number | null;
  created_at?: string;
  stores?: { nama_toko: string };
}

export function CashierView() {
  // State
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    id: 0,
    username: "",
    password: "",
    role: "staff",
    store_id: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    const { data: c } = await supabase
      .from("cashiers")
      .select("*, stores(nama_toko)")
      .order("created_at");

    if (c) setCashiers(c as Cashier[]);

    const { data: s } = await supabase.from("stores").select("*");
    if (s) setStores(s as Store[]);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  // Handlers
  const handleOpenModal = (cashier?: Cashier) => {
    if (cashier) {
      setForm({
        id: cashier.id,
        username: cashier.username,
        password: cashier.password, // masih plain text di v1.0
        role: cashier.role,
        store_id: cashier.store_id?.toString() ?? "",
      });
      setIsEditMode(true);
    } else {
      setForm({ id: 0, username: "", password: "", role: "staff", store_id: "" });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = {
        username: form.username,
        password: form.password,
        role: form.role,
        store_id: form.store_id ? parseInt(form.store_id) : null,
      };

      if (isEditMode) {
        const { error } = await supabase.from("cashiers").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cashiers").insert([payload]);
        if (error) throw error;
      }

      alert(isEditMode ? "Data kasir diperbarui!" : "Kasir berhasil ditambahkan!");
      setIsModalOpen(false);
      await fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Kesalahan tak dikenal";
      alert("Gagal: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin hapus kasir ini?")) {
      await supabase.from("cashiers").delete().eq("id", id);
      await fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Manajemen Akun</h2>
        <Button onClick={() => handleOpenModal()} icon={<Plus size={18} />}>
          Tambah Kasir
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cashiers.map((c) => (
          <Card key={c.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  c.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                }`}
              >
                <UserCog size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{c.username}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant={c.role === "admin" ? "warning" : "neutral"}>{c.role}</Badge>
                  <span className="text-xs text-slate-500 flex items-center">
                    {c.stores?.nama_toko || "Tanpa Toko"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex gap-2 mt-auto">
              <Button variant="outline" className="flex-1 text-sm py-2" onClick={() => handleOpenModal(c)}>
                <Edit size={16} /> Edit
              </Button>
              <Button variant="danger" className="w-12 py-2" onClick={() => handleDelete(c.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{isEditMode ? "Edit Kasir" : "Tambah Kasir Baru"}</h3>

            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              label="Password"
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
              <select
                title="Pilih Role"
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="staff">Staff Kasir</option>
                <option value="admin">Owner / Admin</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Penempatan Toko</label>
              <select
                title="Pilih Toko"
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.store_id}
                onChange={(e) => setForm({ ...form, store_id: e.target.value })}
              >
                <option value="">-- Pilih Toko --</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_toko}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSubmit} isLoading={isLoading}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
