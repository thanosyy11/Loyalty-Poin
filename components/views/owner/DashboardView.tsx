"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StatCard } from "@/components/ui/Card";
import { DashboardChart } from "@/components/charts/DashboardChart";
import { Store, Users, TrendingUp, CreditCard, Loader2 } from "lucide-react";

export function DashboardView() {
  const [stats, setStats] = useState({ stores: 0, cashiers: 0, members: 0, totalPoin: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 1. Fetch Statistik Dasar
      const [resStore, resCashier, resMember, resPoin] = await Promise.all([
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("cashiers").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("members").select("total_poin"),
      ]);

      // 2. Fetch Grafik (Pastikan RPC get_daily_transactions_stats sudah ada di SQL V2.1)
      const { data: chartRes, error } = await supabase.rpc("get_daily_transactions_stats");
      
      if (error) {
        console.error("Grafik Error:", error);
      } else if (chartRes) {
        // Format Data: Recharts butuh array object bersih
        const formatted = chartRes.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            total: Number(item.total_transactions) // Pastikan jadi Number
        }));
        setChartData(formatted);
      }

      // Hitung Total Poin
      const totalPoin = resPoin.data?.reduce((acc, curr) => acc + curr.total_poin, 0) || 0;

      setStats({
        stores: resStore.count || 0,
        cashiers: resCashier.count || 0,
        members: resMember.count || 0,
        totalPoin: totalPoin,
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-slate-800">Overview Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cabang" value={stats.stores} icon={<Store size={24} />} color="blue" />
        <StatCard title="Akun Kasir" value={stats.cashiers} icon={<Users size={24} />} color="indigo" />
        <StatCard title="Total Member" value={stats.members} icon={<TrendingUp size={24} />} color="emerald" trend="Aktif" />
        <StatCard title="Poin Beredar" value={stats.totalPoin.toLocaleString()} icon={<CreditCard size={24} />} color="orange" />
      </div>

      <div className="mt-8">
        {chartData.length > 0 ? (
            <DashboardChart data={chartData} />
        ) : (
            <div className="p-10 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                <p>Grafik akan muncul setelah ada transaksi dalam 7 hari terakhir.</p>
            </div>
        )}
      </div>
    </div>
  );
}