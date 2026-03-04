import { Link } from "react-router-dom";
import { ClipboardList, BarChart3, ArrowRight, UserCheck, Activity, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Landing() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Dashboard</h1>
        <p className="text-slate-500 mt-1">Select an action to proceed with patient evaluation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          to="/evaluation-form"
          title="Evaluation Form"
          description="Conduct a new tactile sensitivity evaluation for a child patient."
          icon={<ClipboardList className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-50"
          delay={0.1}
        />
        <DashboardCard
          to="/evaluation-score"
          title="Evaluation Scores"
          description="Review historical scores and category-wise performance analysis."
          icon={<BarChart3 className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        <StatCard icon={<UserCheck className="w-5 h-5" />} label="Active Patients" value="12" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Evaluations Today" value="4" />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="System Status" value="Secure" />
      </div>
    </div>
  );
}

function DashboardCard({ to, title, description, icon, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        to={to}
        className="group block bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`${color} p-3 rounded-xl transition-transform group-hover:scale-110`}>
            {icon}
          </div>
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </Link>
    </motion.div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className="bg-slate-50 p-2.5 rounded-lg text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
