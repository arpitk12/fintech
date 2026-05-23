import React from "react";
import { Wallet, Mail, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Transaction } from "../types";

interface MetricCardsProps {
  transactions: Transaction[];
  monthlyBudgetTotal: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ transactions, monthlyBudgetTotal }) => {
  // Aggregate Income vs Expenses
  const totalIncome = transactions
    .filter((t) => t.category === "Income")
    .reduce((val, curr) => val + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.category !== "Income")
    .reduce((val, curr) => val + curr.amount, 0);

  // Remaining budget
  const remainingBudget = monthlyBudgetTotal - totalExpense;
  const budgetUtilization = monthlyBudgetTotal > 0 ? (totalExpense / monthlyBudgetTotal) * 100 : 0;

  // Gmail transaction metrics
  const gmailTxCount = transactions.filter((t) => t.source === "gmail").length;
  const gmailTxSpent = transactions
    .filter((t) => t.source === "gmail")
    .reduce((val, curr) => val + curr.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      {/* Gross Cashflow Income Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Simulated Cashflow In</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900">₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1">
          <span className="text-emerald-700 font-bold flex items-center">Linked Checking</span>
          <span className="text-slate-300">•</span>
          <span>Active Bank APIs</span>
        </p>
      </div>

      {/* Credit Card Total Expenses */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Core Credit Expenses</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900">₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5">
          Across <span className="text-slate-800 font-bold">{transactions.filter(t => t.category !== "Income").length}</span> transaction drafts
        </p>
      </div>

      {/* Remaining Monthly Limit */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Remaining Budget</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-extrabold ${remainingBudget < 0 ? "text-rose-600" : "text-blue-600"}`}>
            ₹{remainingBudget.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 font-medium ml-1">of ₹{monthlyBudgetTotal.toLocaleString("en-IN")} limits</span>
        </div>
        {/* Simple Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUtilization > 100
                ? "bg-rose-500"
                : budgetUtilization > 85
                ? "bg-amber-500"
                : "bg-blue-600"
            }`}
            style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Gmail Synced Transactions Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Gmail Inbox Scans</span>
          <div className="w-8 h-8 rounded-lg bg-pink-55 flex items-center justify-center">
            <Mail className="w-4 h-4 text-pink-600" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900">{gmailTxCount} Synced</span>
          <span className="text-xs text-slate-500 ml-1">(₹{gmailTxSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })} total)</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1">
          <span className="text-pink-600 font-semibold">Decrypted TLS</span>
          <span className="text-slate-300">•</span>
          <span>Processed</span>
        </p>
      </div>
    </div>
  );
};
