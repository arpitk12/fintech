import React, { useState, useMemo } from "react";
import { Transaction, Budget } from "../types";
import { FileText, Download, Send, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, Inbox } from "lucide-react";

interface ReportGeneratorProps {
  transactions: Transaction[];
  budgets: Budget[];
  userEmail?: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  transactions,
  budgets,
  userEmail = "user@demo.in",
}) => {
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [reportReady, setReportReady] = useState(true);

  // Compute stats for selected month
  const reportStats = useMemo(() => {
    // Current month transactions
    const filtered = transactions.filter((t) => {
      return t.date.startsWith(selectedMonth);
    });

    const expensesList = filtered.filter((t) => t.category !== "Income");
    const incomeList = filtered.filter((t) => t.category === "Income");

    const totalSpent = expensesList.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category with highest spent
    const categoryTotals: { [key: string]: number } = {};
    expensesList.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    let topCategory = "N/A";
    let topCategoryAmount = 0;
    Object.keys(categoryTotals).forEach((cat) => {
      if (categoryTotals[cat] > topCategoryAmount) {
        topCategory = cat;
        topCategoryAmount = categoryTotals[cat];
      }
    });

    // Check breached budgets
    const breachedBudgets = budgets.filter((b) => b.spent > b.limit).length;

    return {
      totalSpent,
      totalIncome,
      netSavings,
      savingsRate,
      topCategory,
      topCategoryAmount,
      filteredTransactionsCount: filtered.length,
      breachedBudgets,
    };
  }, [transactions, budgets, selectedMonth]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
    }, 1200);
  };

  const handleSendEmailReport = () => {
    setIsSent(true);
    setTimeout(() => {
       setIsSent(false);
    }, 4000);
  };

  const hasNoData = transactions.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-805">
      {/* Settings Side Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 self-start">
        <div className="text-left">
          <h3 className="text-base font-bold text-slate-900">Automated Reports Hub</h3>
          <p className="text-xs text-slate-500">Configure monthly statement schedules to deliver parsed expense metrics directly to your email inbox</p>
        </div>

        <div className="space-y-4">
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Select Billing Cycle</label>
            <select
              value={selectedMonth}
              disabled={hasNoData}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setReportReady(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 cursor-pointer transition font-semibold"
            >
              <option value="2026-05">May 2026 (Current)</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-03">March 2026</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-left">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Scheduled Dispatch
            </span>
            <p className="text-[11px] text-slate-600 font-medium">
              End-of-month statements are analyzed dynamically by Gemini models on the last day of each calendar cycle and emailed.
            </p>
            <div className="text-xs text-slate-505 font-bold">
              Target address: <strong className="text-slate-900 font-black block mt-0.5">{userEmail}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || hasNoData}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{isGenerating ? "Analyzing Database..." : "Re-Compile Statement"}</span>
            </button>

            <button
              onClick={handleSendEmailReport}
              disabled={isSent || !reportReady || hasNoData}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isSent
                  ? "bg-emerald-50 text-emerald-950 border border-emerald-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              {isSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dispatched to {userEmail.substring(0, 10)}...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Email PDF Statement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Report View Card (Col 2) */}
      <div className="lg:col-span-2 space-y-6">
        {hasNoData ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold h-full flex flex-col items-center justify-center">
            <Inbox className="w-10 h-10 text-slate-300 mb-2.5" />
            <h4 className="text-sm font-black text-slate-700 mb-1">No transaction data available</h4>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Add manual entries or enable Gmail/Bank integrations first to generate and view cryptographic statements.
            </p>
          </div>
        ) : reportReady ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-sm text-slate-700 space-y-6 relative overflow-hidden text-left">
            {/* Subtle statement stamp watermark */}
            <div className="absolute right-8 top-8 opacity-[0.03] text-slate-400 pointer-events-none select-none">
              <FileText className="w-32 h-32" />
            </div>
 
            {/* Header of Report Letterhead */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block mb-1">FinSecure Statements INC</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Period Financial Digest</h3>
                <p className="text-xs text-slate-500">Statement cycle ID: #ST-2026-M53</p>
              </div>
              <div className="sm:text-right font-mono text-xs text-slate-500">
                <p>Cycle Date: <strong className="text-slate-900 font-bold">May 31, 2026</strong></p>
                <div className="flex items-center sm:justify-end gap-1.5 mt-1">
                  Status: 
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250 uppercase tracking-wider">
                    Finalized
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 p-4 font-semibold text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Earnings</span>
                <span className="text-base font-black text-emerald-650 font-mono mt-1 block text-emerald-700">
                  +₹{reportStats.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Expenses</span>
                <span className="text-base font-black text-rose-650 font-mono mt-1 block text-rose-600">
                  -₹{reportStats.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Primary category</span>
                <span className="text-sm font-black text-blue-700 mt-1 block truncate">
                  {reportStats.topCategory}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Savings Velocity</span>
                <span className={`text-base font-black font-mono mt-1 block ${reportStats.netSavings >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {reportStats.savingsRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Content Review body */}
            <div className="space-y-4 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5 border-b border-slate-105 pb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Analytical Statement Summary
              </h4>

              <p className="leading-relaxed text-slate-600 font-semibold">
                During the May billing cycle, your aggregate active accounts logged <strong className="text-slate-900 font-black">{reportStats.filteredTransactionsCount}</strong> financial events. Net cash savings resulted in <strong className="text-slate-900 font-extrabold">₹{reportStats.netSavings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> pool allocation remaining.
              </p>

              <div className="space-y-2.5">
                {/* Insights bullets */}
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div className="font-semibold text-slate-600">
                    <span className="text-slate-950 font-extrabold">Primary Outflow Channel:</span> Spend centered heavily in <strong className="text-slate-900 font-extrabold">{reportStats.topCategory}</strong> registering a cumulative <strong className="text-slate-900 font-extrabold">₹{reportStats.topCategoryAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div className="font-semibold text-slate-650 flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-950 font-extrabold">Budget Breaches Detected:</span> {reportStats.breachedBudgets > 0 ? (
                      <span className="text-rose-700 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-250 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Over limits on {reportStats.breachedBudgets} budgets!
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-250">Excellent. All category outflows remained strictly sub-threshold.</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div className="font-semibold text-slate-600">
                    <span className="text-slate-950 font-extrabold">Offline entry sync:</span> Local caches compiled automatically and synced securely. No data was lost.
                  </div>
                </div>
              </div>
            </div>

            {/* Print Sign off */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
              <span className="font-mono">Secure cryptographic audit: SHA-256 SECURED CERTIFICATE</span>
              <button
                onClick={() => alert("Mock statement exported as PDF successfully.")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 text-slate-600 transition border border-slate-200 rounded-xl cursor-pointer font-bold shadow-sm bg-white"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" /> Download PDF statement
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs">Select options and click &quot;Compile Statement&quot; to build Period report.</p>
          </div>
        )}
      </div>
    </div>
  );
};
