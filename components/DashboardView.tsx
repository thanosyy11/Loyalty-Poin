"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, CreditCard, Gift } from "lucide-react";
import { StatCard } from "@/components/ui/Card";

// Terima props storeId agar data terfilter
export default function DashboardView({ storeId }: { storeId: number | null }) {
  const [stats, setStats] = useState({ member: 0, poin: 0, rewards: 0 });

  useEffect(() => {
    const fetchData = async () => {
        if(!storeId) return;

        // 1. Hitung Member di Toko Ini
        const { count: cMember } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId); // FILTER TOKO

        // 2. Hitung Total Poin Member Toko Ini
        const { data: dPoin } = await supabase
            .from('members')
            .select('total_poin')
            .eq('store_id', storeId); // FILTER TOKO

        // 3. Hitung Voucher yang DITUKAR di Toko Ini
        const { count: cRewards } = await supabase
            .from('member_vouchers')
            .select('*', { count: 'exact', head: true })
            .eq('redeem_store_id', storeId) // FILTER TOKO (Redeem)
            .eq('status', 'used');

        setStats({ 
            member: cMember || 0, 
            poin: dPoin?.reduce((a, c) => a + c.total_poin, 0) || 0, 
            rewards: cRewards || 0 
        });
    }
    fetchData();
  }, [storeId]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Ringkasan Toko Anda</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pelanggan Toko Ini" value={stats.member} icon={<Users size={24}/>} color="indigo" />
        <StatCard title="Poin Beredar" value={stats.poin.toLocaleString()} icon={<CreditCard size={24}/>} color="orange" />
        <StatCard title="Voucher Diterima" value={stats.rewards} icon={<Gift size={24}/>} color="emerald" />
      </div>
    </div>
  );
}