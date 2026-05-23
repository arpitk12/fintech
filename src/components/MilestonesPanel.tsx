import React, { useState } from "react";
import { Goal, Transaction, CreditCardAccount } from "../types";
import { Target, Award, Calendar, Plus, Trash2, ShieldCheck, Flame, CreditCard, ChevronRight, CheckCircle, HelpCircle } from "lucide-react";

interface MilestonesPanelProps {
  goals: Goal[];
  transactions: Transaction[];
  creditCards: CreditCardAccount[];
  onAddGoal: (
    name: string,
    cardName: string,
    type: "annual_spend" | "quarterly_spend" | "monthly_spend" | "transaction_count",
    target: number,
    targetCount: number,
    deadline: string,
    rewardDescription: string
  ) => void;
  onDeleteGoal: (id: string) => void;
}

export const MilestonesPanel: React.FC<MilestonesPanelProps> = ({
  goals,
  transactions,
  creditCards = [],
  onAddGoal,
  onDeleteGoal,
}) => {
  // Goal add fields
  const [name, setName] = useState("");
  const [cardName, setCardName] = useState("All Cards");
  const [customCard, setCustomCard] = useState("");
  const [type, setType] = useState<"annual_spend" | "quarterly_spend" | "monthly_spend" | "transaction_count">("annual_spend");
  const [target, setTarget] = useState("");
  const [targetCount, setTargetCount] = useState("5");
  const [deadline, setDeadline] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCardName = cardName === "custom" ? customCard : cardName;
    const finalTarget = parseFloat(target);
    const finalCount = parseInt(targetCount);

    if (name && !isNaN(finalTarget) && deadline && rewardDescription && finalCardName) {
      onAddGoal(
        name,
        finalCardName,
        type,
        finalTarget,
        type === "transaction_count" ? finalCount : 0,
        deadline,
        rewardDescription
      );
      setName("");
      setTarget("");
      setCustomCard("");
      setRewardDescription("");
      // Reset date to default if preferred
    }
  };

  // Compute stats on-the-fly for real-time live data mapping
  const getGoalStatus = (goal: Goal) => {
    if (!goal) {
      return {
        current: 0,
        percent: 0,
        completed: false,
        typeLabel: "Generic Milestone",
        detailsLabel: "Invalid milestone definition"
      };
    }

    const targetVal = Number(goal.target) || 0;
    const targetCountVal = Number(goal.targetCount) || 5;

    // Extract last 4 card digits
    let targetLast4 = "";
    if (goal.cardName) {
      const match = goal.cardName.match(/\((\d{4})\)/) || goal.cardName.match(/\*(\d{4})/);
      if (match) {
        targetLast4 = match[1];
      }
    }

    // Filter transaction logs matching this card (if specific card selected)
    const cardTxs = (transactions || []).filter((t) => {
      if (!t) return false;
      if (t.category === "Income") return false;
      if (!targetLast4) return true;
      return t.cardLast4 === targetLast4;
    });

    const now = new Date("2026-05-23"); // Reference time from current metadata context
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    if (goal.type === "annual_spend") {
      const yearTxs = cardTxs.filter((t) => {
        if (!t || !t.date) return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear;
      });
      const sum = yearTxs.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      return {
        current: sum,
        percent: targetVal > 0 ? Math.min((sum / targetVal) * 100, 100) : 0,
        completed: sum >= targetVal,
        typeLabel: "Annual Fee Waiver Tracker",
        detailsLabel: `₹${sum.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of ₹${targetVal.toLocaleString("en-IN")} spent in ${currentYear}`
      };
    } else if (goal.type === "quarterly_spend") {
      const quarter = Math.floor(currentMonth / 3); // 0 = Q1 (Jan-Mar), 1 = Q2 (Apr-Jun), etc.
      const startMonth = quarter * 3;
      const endMonth = startMonth + 2;

      const quarterTxs = cardTxs.filter((t) => {
        if (!t || !t.date) return false;
        const d = new Date(t.date);
        if (isNaN(d.getTime()) || d.getFullYear() !== currentYear) return false;
        const m = d.getMonth();
        return m >= startMonth && m <= endMonth;
      });
      const sum = quarterTxs.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const quarterNames = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
      return {
        current: sum,
        percent: targetVal > 0 ? Math.min((sum / targetVal) * 100, 100) : 0,
        completed: sum >= targetVal,
        typeLabel: "Quarterly Reward Milestone",
        detailsLabel: `₹${sum.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of ₹${targetVal.toLocaleString("en-IN")} in Q${quarter + 1} (${quarterNames[quarter]})`
      };
    } else if (goal.type === "monthly_spend") {
      const monthTxs = cardTxs.filter((t) => {
        if (!t || !t.date) return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
      const sum = monthTxs.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const monthName = now.toLocaleString("en-IN", { month: "short" });
      return {
        current: sum,
        percent: targetVal > 0 ? Math.min((sum / targetVal) * 100, 100) : 0,
        completed: sum >= targetVal,
        typeLabel: "Monthly Spend Milestone",
        detailsLabel: `₹${sum.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of ₹${targetVal.toLocaleString("en-IN")} in ${monthName}`
      };
    } else if (goal.type === "transaction_count") {
      const monthTxs = cardTxs.filter((t) => {
        if (!t || !t.date) return false;
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth && (Number(t.amount) || 0) >= targetVal;
      });
      const count = monthTxs.length;
      return {
        current: count,
        percent: targetCountVal > 0 ? Math.min((count / targetCountVal) * 100, 100) : 0,
        completed: count >= targetCountVal,
        typeLabel: "Monthly Count Challenge",
        detailsLabel: `${count} of ${targetCountVal} transactions of at least ₹${targetVal.toLocaleString("en-IN")} made in May`
      };
    }

    return {
      current: 0,
      percent: 0,
      completed: false,
      typeLabel: "Generic Milestone",
      detailsLabel: "No spend logs found matching criteria"
    };
  };

  const getDeadlineString = (deadlineStr: string) => {
    if (!deadlineStr) return "No Deadline Set";
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return "No Deadline Set";
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-805">
      {/* Active Milestones Tracker View (Col 2) */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="mb-6 text-left">
            <h3 className="text-base font-bold text-slate-900">Premium Credit Card Milestones</h3>
            <p className="text-xs text-slate-500">Track structural threshold limits to unlock lounge vouchers, waive annual fees, and gain bonus reward points</p>
          </div>

          <div className="space-y-6">
            {(!goals || goals.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No active card milestone schedules found. Define one on the side panel.
              </div>
            ) : (
              goals.map((g) => {
                const status = getGoalStatus(g);

                return (
                  <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left transition-colors hover:border-slate-350">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          status.completed ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}>
                          <Award className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{g.name || "Unnamed Milestone"}</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              g.type === "annual_spend" 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : g.type === "quarterly_spend" 
                                ? "bg-purple-50 text-purple-700 border-purple-200" 
                                : "bg-teal-50 text-teal-700 border-teal-200"
                            }`}>
                              {status.typeLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold font-mono flex items-center gap-1.5 mt-1">
                            <span className="uppercase text-slate-700 font-extrabold">{g.cardName || "All Cards"}</span>
                            <span>•</span>
                            <Calendar className="w-3" /> Ends: {getDeadlineString(g.deadline)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="text-slate-600 font-bold">
                          Progress: <strong className="text-slate-900 font-black">{status.detailsLabel}</strong>
                        </span>
                        <span className={`font-black ${status.completed ? "text-emerald-700" : "text-blue-700"}`}>
                          {(status.percent || 0).toFixed(0)}% Completed
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${status.completed ? "bg-emerald-600" : "bg-blue-600"}`}
                          style={{ width: `${status.percent || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Reward description strip */}
                    <div className="pt-3 border-t border-slate-250 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          Benefit Reward: <strong className="text-slate-900 font-bold">{g.rewardDescription}</strong>
                        </span>
                      </div>

                      {status.completed ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-250 w-fit">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> MILESTONE MET!
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 w-fit">
                          <CreditCard className="w-3.5 h-3.5 text-blue-550" /> TRACKING SPEND...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Quick Helper Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-left">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed font-medium">
                <p className="font-extrabold mb-0.5">How Dynamic Milestone Calculations Work:</p>
                Spend metrics parse automatically from linked credit statements matching your card's digits or transaction types based on selected schedules. Check "Linked Banks" to align card identifiers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Milestone Form Configuration (Col 1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 self-start text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900">Formulate Card Milestone</h3>
          <p className="text-xs text-slate-500">Submit reward spend rules or monthly count frequencies to track dynamically</p>
        </div>

        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Milestone Trigger Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Regalia Annual Fee Reversal"
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Select Issuer Credit Card</label>
            <select
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-550 rounded-xl py-2 px-3 text-xs text-slate-800 font-semibold"
            >
              <option value="All Cards">All Credit Cards combined</option>
              {creditCards.map((c) => (
                <option key={c.id} value={`${c.issuer} ${c.name} (*${c.last4})`}>
                  {c.issuer} {c.name} (*{c.last4})
                </option>
              ))}
              <option value="custom">-- Custom Card Digit --</option>
            </select>
          </div>

          {cardName === "custom" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Custom Card Tag (e.g. Axis *3029)</label>
              <input
                type="text"
                required
                value={customCard}
                onChange={(e) => setCustomCard(e.target.value)}
                placeholder="e.g. Axis Atlas (*3029)"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Spend Track Strategy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("annual_spend")}
                className={`py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer leading-tight ${
                  type === "annual_spend"
                    ? "bg-amber-50 border-amber-250 text-amber-700 shadow-sm font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                Annual Spend
              </button>
              <button
                type="button"
                onClick={() => setType("quarterly_spend")}
                className={`py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer leading-tight ${
                  type === "quarterly_spend"
                    ? "bg-purple-50 border-purple-250 text-purple-700 shadow-sm font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                Quarter Spend
              </button>
              <button
                type="button"
                onClick={() => setType("monthly_spend")}
                className={`py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer leading-tight ${
                  type === "monthly_spend"
                    ? "bg-teal-50 border-teal-250 text-teal-700 shadow-sm font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                Monthly Spend
              </button>
              <button
                type="button"
                onClick={() => setType("transaction_count")}
                className={`py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer leading-tight ${
                  type === "transaction_count"
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                Count of X Spend
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                {type === "transaction_count" ? "Min Tx Amount (₹)" : "Target Limit (₹)"}
              </label>
              <input
                type="number"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={type === "transaction_count" ? "1000" : "100000"}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 font-extrabold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Target Date</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700"
              />
            </div>
          </div>

          {type === "transaction_count" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Target Count (Times per month)</label>
              <input
                type="number"
                required
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="5"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Waiver Voucher / Reward benefit</label>
            <input
              type="text"
              required
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="e.g. Waive custom ₹4,999 annual fee"
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md tracking-wide"
          >
            Formulate Card Milestone
          </button>
        </form>
      </div>
    </div>
  );
};
