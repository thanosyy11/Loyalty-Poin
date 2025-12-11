"use client";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react"; // Tambah Icon Menu & X
import { ReactNode } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  title: string;
  menuItems: MenuItem[];
  activeMenu: string;
  onMenuClick: (id: string) => void;
  onLogout: () => void;
  userRole?: string;
}

export function Sidebar({
  title,
  menuItems,
  activeMenu,
  onMenuClick,
  onLogout,
  userRole
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false); // State untuk Mobile Menu

  // Wrapper function untuk klik menu (tutup sidebar jika di mobile)
  const handleMenuClick = (id: string) => {
    onMenuClick(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* MOBILE HEADER (Hanya muncul di layar kecil) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-md">
        <span className="font-bold text-lg">
          {title}
          <span className="text-indigo-400">.</span>
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-slate-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY (Background gelap saat sidebar buka di mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
  fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-full"} 
  md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex md:shrink-0
`}
      >
        {/* Header Desktop */}
        <div className="h-20 hidden md:flex items-center px-6 border-b border-slate-800 shrink-0">
          <h1 className="text-xl font-bold tracking-tight">
            {title}
            <span className="text-indigo-400">.</span>
          </h1>
        </div>

        {/* Menu List */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <div className="text-xs font-bold text-slate-500 uppercase px-4 py-2 mb-2">
            Menu Utama
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${
                  activeMenu === item.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <span
                className={`${
                  activeMenu === item.id
                    ? "text-white"
                    : "text-slate-500 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 pb-8 md:pb-4">
          {userRole && (
            <div className="mb-4 px-4 py-2 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Login Sebagai
              </p>
              <p className="text-sm font-medium text-white capitalize truncate">
                {userRole}
              </p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:text-white hover:bg-red-600/20 rounded-xl transition-colors items-center"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
