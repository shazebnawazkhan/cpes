import { useState, useEffect } from "react";
import { api } from "../services/api";
import { BarChart3, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { motion } from "motion/react";

export default function EvaluationScore() {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const data = await api.get("/scores");
      setScores(data);
    } catch (error) {
      console.error("Failed to fetch scores", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading scores...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Evaluation Scores</h1>
          <p className="text-slate-500 mt-1">Summary of patient performance across all categories.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {scores.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-slate-300 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Evaluations Yet</h2>
          <p className="text-slate-500">Complete an evaluation form to see scores here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Summary Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Category Performance Analysis</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Responses</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Avg Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scores.map((score) => (
                    <tr key={score.category_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-800 capitalize">
                          {score.category_id.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold">
                          {score.count}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-mono font-bold text-slate-700">
                        {score.total_score}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-indigo-600">{score.average_score.toFixed(2)}</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${(score.average_score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ScoreIndicator score={score.average_score} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scores.map((score) => (
              <div key={score.category_id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 capitalize">{score.category_id.replace(/_/g, " ")}</h3>
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">{score.average_score.toFixed(1)}</span>
                  <span className="text-slate-400 font-bold text-sm">/ 5.0</span>
                </div>
                <p className="text-slate-500 text-xs mt-1 font-medium">Average across {score.count} metrics</p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trend</span>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    Stable
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  if (score >= 4) return (
    <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
      <TrendingUp className="w-3 h-3" />
      Excellent
    </div>
  );
  if (score >= 3) return (
    <div className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
      <Minus className="w-3 h-3" />
      Typical
    </div>
  );
  return (
    <div className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
      <TrendingDown className="w-3 h-3" />
      Attention
    </div>
  );
}
