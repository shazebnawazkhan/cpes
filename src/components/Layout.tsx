import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { LogOut, ClipboardList, BarChart3, Home, User } from "lucide-react";
import { api } from "../services/api";

interface LayoutProps {
  user: any;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout", {});
      onLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <ClipboardList className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">ChildEval Pro</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 mr-4">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 hidden md:block">
          <nav className="space-y-1">
            <SidebarLink to="/" icon={<Home className="w-4 h-4" />} label="Dashboard" />
            <SidebarLink to="/evaluation-form" icon={<ClipboardList className="w-4 h-4" />} label="Evaluation Form" />
            <SidebarLink to="/evaluation-score" icon={<BarChart3 className="w-4 h-4" />} label="Evaluation Scores" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium text-sm"
    >
      {icon}
      {label}
    </Link>
  );
}
