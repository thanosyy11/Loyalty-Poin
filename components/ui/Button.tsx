import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg"; // <--- KITA TAMBAHKAN INI
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", // Default size
  isLoading, 
  icon, 
  className = "", 
  disabled,
  ...props 
}: ButtonProps) {
  
  // Base styles
  const baseStyles = "flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
  
  // Variants Color
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 bg-transparent"
  };

  // Variants Size (PENTING AGAR TIDAK ERROR)
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 size={size === 'sm' ? 14 : 20} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}