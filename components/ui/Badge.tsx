interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "neutral";
}

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-orange-100 text-orange-700 border-orange-200",
    error: "bg-red-100 text-red-700 border-red-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[variant]} uppercase tracking-wider`}>
      {children}
    </span>
  );
}