"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layouts/Sidebar";
import { LayoutDashboard, Users, QrCode, UserPlus, Settings, Gift, History } from "lucide-react";
import HistoryView from "@/components/HistoryView"; 

// Import Views
import DashboardView from "@/components/DashboardView"; 
import TransactionView from "@/components/TransactionView";
import { RegisterView } from "@/components/RegisterView"; 
import MemberListView from "@/components/MemberListView"; 
import SettingsView from "@/components/SettingsView";
import { ValidatorView } from "@/components/views/kasir/ValidatorView";

function KasirContent() {
  const { session, logout } = useAuth('staff');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Gunakan URL params agar saat refresh tidak kembali ke dashboard
  const activeMenu = searchParams.get("tab") || "pos";

  const handleMenuClick = (id: string) => {
    router.push(`/kasir?tab=${id}`);
  };

  if (!session) return null;

  const menuItems = [
    { id: 'pos', label: 'Transaksi Poin', icon: <QrCode size={20} /> },
    { id: 'validator', label: 'Validasi Voucher', icon: <Gift size={20} /> },
    { id: 'dashboard', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },

    // ===========================
    // 🔥 MENU BARU (RIWAYAT TOKO)
    // ===========================
    { id: 'history', label: 'Riwayat Toko', icon: <History size={20} /> },

    { id: 'register', label: 'Registrasi Member', icon: <UserPlus size={20} /> },
    { id: 'members', label: 'Data Pelanggan', icon: <Users size={20} /> },
    { id: 'settings', label: 'Akun Saya', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-poppins">
      <Sidebar 
        title="Kasir" 
        menuItems={menuItems} 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick} 
        onLogout={logout} 
        userRole={`${session.storeName}`} 
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-24 md:pt-8 w-full">
        <div className="max-w-4xl mx-auto">
          
          {activeMenu === 'dashboard' && <DashboardView storeId={session.storeId} />}
          
          {activeMenu === 'pos' && <TransactionView session={session} />}
          
          {activeMenu === 'validator' && (
             <div className="max-w-xl mx-auto">
                <ValidatorView /> 
             </div>
          )}
        
          {activeMenu === 'register' && <RegisterView />}
          {activeMenu === 'members' && <MemberListView storeId={session.storeId} />}
          {activeMenu === 'history' && <HistoryView storeId={session.storeId} />}
          {activeMenu === 'settings' && <SettingsView session={session} />}

        </div>
      </main>
    </div>
  );
}

export default function KasirPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Kasir...</div>}>
      <KasirContent />
    </Suspense>
  );
}
