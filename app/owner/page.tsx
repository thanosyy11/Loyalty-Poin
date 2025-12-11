"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layouts/Sidebar";
import { LayoutDashboard, Users, Gift, History, UserCog, Store, Settings } from "lucide-react";

// Import Views
import { DashboardView } from "@/components/views/owner/DashboardView";
import { TransactionHistoryView } from "@/components/views/owner/TransactionHistoryView";
import { MemberDataView } from "@/components/views/owner/MemberDataView";
import { CashierView } from "@/components/views/owner/CashierView";
import { StoreView } from "@/components/views/owner/StoreView"; 
import { OwnerValidatorView } from "@/components/views/owner/OwnerValidatorView";
import { OwnerSettingsView } from "@/components/views/owner/OwnerSettingView";

function OwnerContent() {
  const { session, logout } = useAuth('admin'); 
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default tab ke dashboard
  const currentTab = searchParams.get("tab") || "dashboard";

  const handleMenuClick = (id: string) => {
    router.push(`/owner?tab=${id}`);
  };

  if (!session) return null; 

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'history', label: 'Riwayat Transaksi', icon: <History size={20} /> },
    { id: 'members', label: 'Data Member & PIN', icon: <Users size={20} /> },
    { id: 'store', label: 'Manajemen Toko', icon: <Store size={20} /> }, // Menu Baru
    { id: 'cashier', label: 'Manajemen Kasir', icon: <UserCog size={20} /> },
    { id: 'validator', label: 'Validasi Voucher', icon: <Gift size={20} /> },
    { id: 'settings', label: 'Pengaturan Global', icon: <Settings size={20} /> }, // Menu Baru
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-poppins">
      <Sidebar 
        title="Owner" 
        menuItems={menuItems} 
        activeMenu={currentTab} 
        onMenuClick={handleMenuClick}
        onLogout={logout}
        userRole="Administrator"
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8 w-full">
        <div className="max-w-6xl mx-auto">
          {currentTab === "dashboard" && <DashboardView />}
          
          {currentTab === "history" && <TransactionHistoryView />}
          
          {currentTab === "members" && <MemberDataView />}
          
          {currentTab === "store" && <StoreView />}
          
          {currentTab === "cashier" && <CashierView />}
          
          {currentTab === "validator" && <OwnerValidatorView />}

          {currentTab === "settings" && <OwnerSettingsView />}
        </div>
      </main>
    </div>
  );
}

export default function OwnerPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Owner Portal...</div>}>
      <OwnerContent />
    </Suspense>
  );
}