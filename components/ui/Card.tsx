import { ReactNode } from "react";

// 1. Basic Card Wrapper
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

// 2. Stat Card (Untuk Dashboard Owner)
interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string; // misal: "+5% dari minggu lalu"
  color?: "indigo" | "emerald" | "orange" | "blue"; // Tema warna
}

export function StatCard({ title, value, icon, trend, color = "indigo" }: StatCardProps) {
  // Mapping warna background icon
  const colorMap = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{value}</h3>
      </div>
    </Card>
  );
}