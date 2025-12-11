"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Store, User, Key, Percent, Gift } from "lucide-react";
import { InputGroup } from "./kasirUI";

export default function SettingsView({ session }: any) {
  // Tentukan Tab Default: Kalau Admin ke 'store', kalau Staff ke 'account'
  const [tab, setTab] = useState(
    session.role === "admin" ? "store" : "account"
  );
  const [loading, setLoading] = useState(false);

  // STATE DATA
  const [stores, setStores] = useState<any[]>([]);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [poinDivisor, setPoinDivisor] = useState("25000");

  // STATE FORM
  const [newStore, setNewStore] = useState({ name: "", address: "" });
  const [newCashier, setNewCashier] = useState({
    user: "",
    pass: "",
    storeId: "",
    role: "staff",
  });
  const [newReward, setNewReward] = useState({ nama: "", poin: "", value: "" });
  const [passForm, setPassForm] = useState({ old: "", new: "" });

  // --- FETCH DATA (Hanya jika Admin) ---
  useEffect(() => {
    const fetchData = async () => {
      if (session.role !== "admin") return; // Staff tidak perlu ambil data toko/kasir

      const { data: s } = await supabase.from("stores").select("*");
      if (s) setStores(s);

      const { data: c } = await supabase
        .from("cashiers")
        .select("*, stores(nama_toko)")
        .order("created_at");
      if (c) setCashiers(c);

      const { data: r } = await supabase
        .from("rewards")
        .select("*")
        .order("poin_butuh");
      if (r) setRewards(r);

      const { data: sett } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "poin_divisor")
        .single();
      if (sett) setPoinDivisor(sett.value);
    };
    fetchData();
  }, [session.role]);

  // --- ACTION HANDLERS ---

  // 1. TAMBAH TOKO
  const addStore = async () => {
    if (!newStore.name) return alert("Nama toko wajib!");
    await supabase
      .from("stores")
      .insert([{ nama_toko: newStore.name, alamat: newStore.address }]);
    setNewStore({ name: "", address: "" });
    alert("✅ Toko berhasil dibuat");
    // Refresh manual sederhana
    window.location.reload();
  };

  // 2. TAMBAH KASIR
  const addCashier = async () => {
    if (!newCashier.user || !newCashier.pass || !newCashier.storeId)
      return alert("Isi lengkap!");
    const { error } = await supabase.from("cashiers").insert([
      {
        username: newCashier.user,
        password: newCashier.pass,
        store_id: parseInt(newCashier.storeId),
        role: newCashier.role,
      },
    ]);
    if (error) alert("Gagal (Mungkin username kembar?)");
    else {
      setNewCashier({ user: "", pass: "", storeId: "", role: "staff" });
      alert("✅ Kasir berhasil dibuat");
      window.location.reload();
    }
  };

  // 3. UPDATE PASSWORD (Bisa untuk Admin & Staff)
  const updatePassword = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("cashiers")
      .update({ password: passForm.new })
      .eq("id", session.id);
    if (error) alert("Gagal update password");
    else {
      alert("✅ Password berhasil diganti!");
      setPassForm({ old: "", new: "" });
    }
    setLoading(false);
  };

  // 4. ATURAN POIN & REWARD
  const saveRule = async () => {
    await supabase
      .from("settings")
      .upsert({ key: "poin_divisor", value: poinDivisor });
    alert("Disimpan!");
  };

  const addReward = async () => {
    await supabase.from("rewards").insert([
      {
        nama_hadiah: newReward.nama,
        poin_butuh: newReward.poin,
        nilai_voucher: newReward.value,
      },
    ]);
    setNewReward({ nama: "", poin: "", value: "" });
    alert("Reward ditambahkan");
    // Untuk refresh list reward, kita fetch ulang sederhana (atau reload)
    const { data } = await supabase.from("rewards").select("*").order("poin_butuh");
    if(data) setRewards(data);
  };

  const deleteItem = async (table: string, id: number) => {
    if (confirm("Hapus item ini?")) {
      await supabase.from(table).delete().eq("id", id);
      alert("Terhapus");
      // Refresh halaman untuk update tabel
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl animate-fade-in-up">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Pengaturan {session.role === "admin" ? "Owner" : "Akun"}
      </h2>

      {/* TAB MENU */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-4">
        {session.role === "admin" && (
          <>
            <TabButton
              active={tab === "store"}
              onClick={() => setTab("store")}
              icon={<Store size={16} />}
              label="Cabang Toko"
            />
            <TabButton
              active={tab === "cashier"}
              onClick={() => setTab("cashier")}
              icon={<User size={16} />}
              label="Manajemen Kasir"
            />
            <TabButton
              active={tab === "rules"}
              onClick={() => setTab("rules")}
              icon={<Percent size={16} />}
              label="Aturan Poin"
            />
          </>
        )}
        <TabButton
          active={tab === "account"}
          onClick={() => setTab("account")}
          icon={<Key size={16} />}
          label="Ganti Password"
        />
      </div>

      {/* CONTENT: MANAJEMEN TOKO (OWNER) */}
      {tab === "store" && session.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit">
            <h3 className="font-bold text-slate-800 mb-4">
              Tambah Cabang Baru
            </h3>
            <InputGroup
              label="Nama Toko"
              value={newStore.name}
              onChange={(e: any) =>
                setNewStore({ ...newStore, name: e.target.value })
              }
            />
            <InputGroup
              label="Alamat (Opsional)"
              value={newStore.address}
              onChange={(e: any) =>
                setNewStore({ ...newStore, address: e.target.value })
              }
            />
            <button
              onClick={addStore}
              className="w-full bg-slate-900 text-white py-2 rounded-xl text-sm font-bold mt-2 hover:bg-slate-800"
            >
              Simpan Toko
            </button>
          </div>
          <div className="space-y-3">
            {stores.map((s) => (
              <div
                key={s.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{s.nama_toko}</h4>
                  <p className="text-xs text-slate-500">
                    {s.alamat || "Tidak ada alamat"}
                  </p>
                </div>
                <button
                  aria-label="Hapus Toko"
                  onClick={() => deleteItem("stores", s.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: MANAJEMEN KASIR (OWNER) */}
      {tab === "cashier" && session.role === "admin" && (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-indigo-800 block mb-1">
                Username
              </label>
              <input
                aria-label="Username Kasir Baru"
                className="w-full p-2 rounded-lg"
                value={newCashier.user}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, user: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-indigo-800 block mb-1">
                Password
              </label>
              <input
                aria-label="Password Kasir Baru"
                className="w-full p-2 rounded-lg"
                value={newCashier.pass}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, pass: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-indigo-800 block mb-1">
                Role
              </label>
              <select
                aria-label="Pilih Role"
                className="w-full p-2 rounded-lg bg-white"
                value={newCashier.role}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, role: e.target.value })
                }
              >
                <option value="staff">Staff</option>
                <option value="admin">Owner</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-indigo-800 block mb-1">
                Penempatan
              </label>
              <select
                aria-label="Pilih Toko"
                className="w-full p-2 rounded-lg bg-white"
                value={newCashier.storeId}
                onChange={(e) =>
                  setNewCashier({ ...newCashier, storeId: e.target.value })
                }
              >
                <option value="">Pilih Toko...</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_toko}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addCashier}
              className="bg-indigo-600 text-white h-10 rounded-lg font-bold hover:bg-indigo-700"
            >
              Tambah
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cashiers.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      c.role === "admin"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{c.username}</h4>
                    <p className="text-xs text-slate-500">
                      {c.role.toUpperCase()} • {c.stores?.nama_toko || "No Store"}
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Hapus Kasir"
                  onClick={() => deleteItem("cashiers", c.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: ATURAN & REWARD (OWNER) */}
      {tab === "rules" && session.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit">
            <h3 className="font-bold text-slate-800 mb-4">Nilai Poin</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-500">Rp</span>
              <input
                aria-label="Nominal per 1 Poin"
                className="border p-2 rounded font-bold w-24"
                value={poinDivisor}
                onChange={(e) => setPoinDivisor(e.target.value)}
              />
              <span className="text-sm text-slate-500">= 1 Poin</span>
            </div>
            <button
              onClick={saveRule}
              className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800"
            >
              Simpan
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2 text-sm">
                Tambah Reward
              </h4>
              <div className="flex gap-2">
                <input
                  aria-label="Nama Hadiah"
                  placeholder="Nama"
                  className="w-full p-2 rounded text-sm"
                  value={newReward.nama}
                  onChange={(e) =>
                    setNewReward({ ...newReward, nama: e.target.value })
                  }
                />
                <input
                  aria-label="Poin Dibutuhkan"
                  placeholder="Poin"
                  className="w-16 p-2 rounded text-sm"
                  value={newReward.poin}
                  onChange={(e) =>
                    setNewReward({ ...newReward, poin: e.target.value })
                  }
                />
                <input
                  aria-label="Nilai Rupiah"
                  placeholder="Nilai (Rp)"
                  className="w-20 p-2 rounded text-sm"
                  value={newReward.value}
                  onChange={(e) =>
                    setNewReward({ ...newReward, value: e.target.value })
                  }
                />
              </div>
              <button
                onClick={addReward}
                className="w-full bg-indigo-600 text-white py-2 rounded mt-2 text-sm font-bold hover:bg-indigo-700"
              >
                Tambah
              </button>
            </div>
            {rewards.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center"
              >
                <span className="text-sm font-bold text-slate-700">
                  {r.nama_hadiah} ({r.poin_butuh} pts)
                </span>
                <button
                  aria-label="Hapus Reward"
                  onClick={() => deleteItem("rewards", r.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: GANTI PASSWORD (SEMUA USER) */}
      {tab === "account" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 max-w-md">
          <h3 className="font-bold text-slate-800 mb-4">Keamanan Akun</h3>
          <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg mb-4">
            Anda login sebagai <b>{session.name}</b> ({session.role}). Password
            baru akan langsung aktif.
          </div>
          <InputGroup
            label="Password Baru"
            type="text"
            value={passForm.new}
            onChange={(e: any) =>
              setPassForm({ ...passForm, new: e.target.value })
            }
          />
          <button
            onClick={updatePassword}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold w-full hover:bg-indigo-700"
          >
            {loading ? "Menyimpan..." : "Ganti Password"}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper Tab UI
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition ${
        active
          ? "border-indigo-600 text-indigo-600"
          : "border-transparent text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon} {label}
    </button>
  );
}