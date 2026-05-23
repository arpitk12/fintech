import React, { useState } from "react";
import { Budget, BillPaymentAlert } from "../types";
import { AlertTriangle, Bell, Edit3, CheckCircle, Calendar, Sparkles } from "lucide-react";

interface BudgetsPanelProps {
  budgets: Budget[];
  alerts: BillPaymentAlert[];
  onUpdateLimit: (category: string, newLimit: number) => void;
  onAddAlert: (title: string, dueDate: string, amount: number, category: string) => void;
  onMarkAlertPaid: (id: string) => void;
}

export const BudgetsPanel: React.FC<BudgetsPanelProps> = ({
  budgets,
  alerts,
  onUpdateLimit,
  onAddAlert,
  onMarkAlertPaid,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState("");

  // Alert fields
  const [alertTitle, setAlertTitle] = useState("");
  const [alertAmount, setAlertAmount] = useState("");
  const [alertDueDate, setAlertDueDate] = useState("");
  const [alertCategory, setAlertCategory] = useState("Credit Card Payment");

  const startEdit = (b: Budget) => {
    setEditingCategory(b.category);
    setTempLimit(b.limit.toString());
  };

  const saveEdit = (category: string) => {
    const lim = parseFloat(tempLimit);
    if (!isNaN(lim) && lim >= 0) {
      onUpdateLimit(category, lim);
    }
    setEditingCategory(null);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(alertAmount);
    if (alertTitle && alertDueDate && !isNaN(amt)) {
      onAddAlert(alertTitle, alertDueDate, amt, alertCategory);
      setAlertTitle("");
      setAlertAmount("");
      setAlertDueDate("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-805">
      {/* Category Budget Alerts Progress Left (Col 2) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
        <div className="text-left">
          <h3 className="text-base font-bold text-slate-900">Monthly Budgets by Categories</h3>
          <p className="text-xs text-slate-500">Automated limits with alerts triggered at 85% and 100% boundary limits in Rupees</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const usagePercent = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            const isOver = b.spent > b.limit;
            const isWarning = b.spent > b.limit * 0.85 && b.spent <= b.limit;

            return (
              <div key={b.category} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden group text-left">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-850">{b.category}</h4>
                    <p className="text-[10px] text-slate-500 font-bold font-mono">
                      Spent: ₹{b.spent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {editingCategory === b.category ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempLimit}
                          onChange={(e) => setTempLimit(e.target.value)}
                          className="w-20 bg-white border border-slate-350 text-xs text-slate-850 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => saveEdit(b.category)}
                          className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer transition"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono font-extrabold text-slate-700">
                          Limit: ₹{b.limit.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => startEdit(b)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition rounded cursor-pointer"
                          title="Adjust Limit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>

                {/* Alerts indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-slate-400">
                    {usagePercent.toFixed(0)}% Utilized
                  </span>

                  {isOver ? (
                    <span className="flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-sm">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Over Spend Limit!
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm">
                      <AlertTriangle className="w-3 h-3 text-amber-500" /> Near Limit Notice!
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-250 shadow-sm">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Optimal Spend
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Alarms Config (Col 1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6 text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900">Automated Payment Alerts</h3>
          <p className="text-xs text-slate-500">Track upcoming billing cycles on linked credit cards or landlord utilities</p>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Create custom reminder
          </span>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Account Description</label>
            <input
              type="text"
              required
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="e.g. HDFC Regalia Payment"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-2.0 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-550"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Amount (₹)</label>
              <input
                type="number"
                required
                value={alertAmount}
                onChange={(e) => setAlertAmount(e.target.value)}
                placeholder="10000"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-2.0 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-550"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Due Date</label>
              <input
                type="date"
                required
                value={alertDueDate}
                onChange={(e) => setAlertDueDate(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 text-white" /> Set Reminder
          </button>
        </form>

        {/* Live Alerts list */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {alerts.map((al) => (
            <div key={al.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-left">
              <div>
                <h5 className="font-bold text-slate-800 truncate max-w-[150px]">{al.title}</h5>
                <p className="text-[10px] text-slate-505 font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-blue-600" /> 
                  Due {new Date(al.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-slate-850 text-[11px] block">₹{al.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                
                {al.status === "paid" ? (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                    Settled
                  </span>
                ) : (
                  <button
                    onClick={() => onMarkAlertPaid(al.id)}
                    className="mt-1 text-[9px] font-bold text-rose-700 hover:text-emerald-700 bg-rose-50 hover:bg-emerald-50 px-2 ... py-0.5 rounded border border-rose-200 hover:border-emerald-250 transition cursor-pointer"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
