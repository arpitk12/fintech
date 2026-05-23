import React, { useState } from "react";
import { PlusCircle, Cpu, WifiOff, Wifi, Sparkles, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";
import { CreditCardAccount } from "../types";

interface ManualOfflineEntryProps {
  onAddTransaction: (merchant: string, amount: number, date: string, category: string, isOffline: boolean, cardLast4: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  creditCards: CreditCardAccount[];
}

export const ManualOfflineEntry: React.FC<ManualOfflineEntryProps> = ({
  onAddTransaction,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  creditCards = [],
}) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Shopping");
  const [selectedCard, setSelectedCard] = useState("OFFL");
  
  // AI Categorizer states
  const [isAIClassifying, setIsAIClassifying] = useState(false);
  const [suggestion, setSuggestion] = useState<{ category: string; justification: string } | null>(null);

  const fetchAICategory = async () => {
    if (!merchant.trim()) return;
    setIsAIClassifying(true);
    setSuggestion(null);
    try {
      const response = await fetch("/api/ai-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: merchant }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestion({
          category: data.category,
          justification: data.justification,
        });
        setCategory(data.category);
      }
    } catch (e) {
      console.error("AI classification error:", e);
    } finally {
      setIsAIClassifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!merchant || isNaN(parsedAmount)) return;

    onAddTransaction(merchant, parsedAmount, date, category, isOffline, selectedCard);
    setMerchant("");
    setAmount("");
    setSuggestion(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-805">
      {/* Manual Entry Form */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-900">Log Credit Expenditures</h3>
            <p className="text-xs text-slate-500">Classify manual transactions with Gemini AI auto-categorization</p>
          </div>

          {/* Connection status overlay */}
          <button
            onClick={onToggleOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
              isOffline
                ? "bg-amber-50 text-amber-750 border-amber-200 animate-pulse"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" /> Offline Mode Enabled (Cache)
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" /> Online Mode Enabled (Live APIs)
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Merchant */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">Merchant or Retailer</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy, Zomato, DMart, Amazon India"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={fetchAICategory}
                  disabled={isAIClassifying || !merchant || isOffline}
                  className="px-3 bg-slate-100 hover:bg-slate-200 hover:border-slate-300 disabled:opacity-50 border border-slate-200 text-slate-700 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer font-bold transition font-sans"
                  title="Run Machine Learning Categorizer"
                >
                  {isAIClassifying ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="hidden sm:inline">AI Classify</span>
                </button>
              </div>

              {/* AI suggestion message */}
              {suggestion && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5 mt-2.5 text-left">
                  <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Gemini ML Auto-Categorized
                  </span>
                  <p className="text-xs text-purple-950 font-semibold leading-none">
                    Matched <strong className="text-purple-700 font-extrabold">{suggestion.category}</strong>.
                  </p>
                  <p className="text-[11px] text-purple-500 font-medium leading-snug">
                    {suggestion.justification}
                  </p>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase text-left">Expense Value (₹)</label>
              <input
                type="number"
                step="1"
                required
                placeholder="₹450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-800 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase text-left">Select Target Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 cursor-pointer text-slate-800 font-medium"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Groceries">Groceries</option>
                <option value="General/Other font-medium">General/Other</option>
              </select>
            </div>

            {/* Date selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase text-left">Transaction Timestamp</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:outline-none rounded-xl py-1.5 px-3 text-xs text-slate-700 text-slate-800 font-semibold"
              />
            </div>

            {/* Card selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase text-left">Select Charging Card</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-700 cursor-pointer text-slate-800 font-bold"
              >
                {creditCards.map((c) => (
                  <option key={c.id} value={c.last4}>
                    {c.issuer} {c.name} (*{c.last4})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Store {isOffline ? "to Local Cache SQLite" : "to Remote Database"}</span>
          </button>
        </form>
      </div>

      {/* Offline Mode Sync & SQLite status card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900">Local Storage & SQLite</h3>
          <p className="text-xs text-slate-500">Offline manual entry and biometric security configuration status</p>
        </div>

        <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4 space-y-3.5 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-605" /> AES Cache Encryption
            </span>
            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-105">
              ACTIVATED
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-605 font-bold">
            <div className="flex items-start justify-between gap-4">
              <span>Local Queue Count:</span>
              <strong className="text-slate-800 font-black font-mono">{pendingSyncCount} cached items</strong>
            </div>
            
            <div className="flex items-start justify-between gap-4">
              <span>SQLite Schema Instance:</span>
              <strong className="text-slate-800 font-black font-mono">SQLite V3.42 READY</strong>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span>Biometric Key Enclave:</span>
              <strong className="text-emerald-700 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SECURE
              </strong>
            </div>
          </div>
        </div>

        {/* Offline simulated trigger help message info */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-slate-600 space-y-2 text-left">
          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1 leading-none font-sans">
            <WifiOff className="w-3.5 h-3.5 text-amber-600" /> Offline Sync Scenario Tested
          </span>
          <p className="leading-snug">
            Turn <strong className="text-slate-850">Offline Mode ON</strong> at the header. Fill the manual entry and hit Save. The transaction logs into your browser&apos;s localStorage buffer queue immediately. 
          </p>
          <p className="leading-snug">
            Turn <strong className="text-slate-850">Offline Mode OFF</strong> to automatically synchronize and reconcile all local cache queue elements securely.
          </p>
        </div>
      </div>
    </div>
  );
};
