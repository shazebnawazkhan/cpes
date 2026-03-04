import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ClipboardList, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function EvaluationForm() {
  const [config, setConfig] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await api.get("/questions");
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formattedResponses: any[] = [];
      config.categories.forEach((cat: any) => {
        cat.questions.forEach((q: any) => {
          const responseValue = responses[q.id];
          if (responseValue) {
            formattedResponses.push({
              categoryId: cat.id,
              questionId: q.id,
              response: responseValue,
              score: config.scoring_map[responseValue],
            });
          }
        });
      });

      await api.post("/evaluate", { responses: formattedResponses });
      setSuccess(true);
      setTimeout(() => navigate("/evaluation-score"), 2000);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading questionnaire...</div>;

  const options = Object.keys(config.scoring_map);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Evaluation Questionnaire</h1>
          <p className="text-slate-500 mt-1">Complete the form below for the patient assessment.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold border border-indigo-100 flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Clinical Assessment
        </div>
      </header>

      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center"
          >
            <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="text-white w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Evaluation Submitted!</h2>
            <p className="text-emerald-700">The patient data has been securely stored. Redirecting to scores...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10 pb-20">
            {config.categories.map((category: any) => (
              <div key={category.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">{category.name}</h2>
                  <span className="text-xs font-bold text-slate-400">{category.questions.length} Questions</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {category.questions.map((q: any, idx: number) => (
                    <div key={q.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="bg-slate-100 text-slate-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-slate-700 font-medium leading-relaxed">{q.text}</p>
                        </div>
                      </div>
                      <div className="w-full md:w-64">
                        <select
                          required
                          value={responses[q.id] || ""}
                          onChange={(e) => handleResponseChange(q.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:border-indigo-300"
                        >
                          <option value="" disabled>Select response...</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 pointer-events-none">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl shadow-slate-300/50 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium ml-2">
                  <AlertCircle className="w-4 h-4" />
                  Ensure all questions are answered
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting ? "Submitting..." : "Submit Evaluation"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
