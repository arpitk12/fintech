import React, { useMemo, useState } from "react";
import { CreditCard, Layers, Shield, Plus, X, Sparkles, Check } from "lucide-react";
import { Transaction, CreditCardAccount } from "../types";

interface CardsSliderProps {
  transactions: Transaction[];
  creditCards: CreditCardAccount[];
  onAddCreditCard: (card: Omit<CreditCardAccount, "id">) => void;
  selectedCard: string;
  onSelectCard: (cardLast4: string) => void;
}

interface PredefinedGradient {
  label: string;
  value: string;
  chipColor: string;
}

const PRESETS: PredefinedGradient[] = [
  { label: "Midnight Obsidian", value: "from-slate-950 via-zinc-900 to-neutral-950", chipColor: "bg-yellow-500" },
  { label: "Royal Sapphire", value: "from-indigo-950 via-blue-900 to-slate-800", chipColor: "bg-slate-300" },
  { label: "Emerald Jade", value: "from-emerald-950 via-teal-900 to-emerald-900", chipColor: "bg-yellow-600" },
  { label: "Velvet Crimson", value: "from-rose-950 via-red-950 to-stone-900", chipColor: "bg-amber-400" },
  { label: "Deep Violet", value: "from-purple-950 via-indigo-950 to-neutral-950", chipColor: "bg-slate-300" },
];

export const CardsSlider: React.FC<CardsSliderProps> = ({
  transactions = [],
  creditCards = [],
  onAddCreditCard,
  selectedCard,
  onSelectCard,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Input fields for card addition
  const [bankName, setBankName] = useState("");
  const [cardName, setCardName] = useState("");
  const [last4, setLast4] = useState("");
  const [limit, setLimit] = useState("");
  const [selectedGradientIdx, setSelectedGradientIdx] = useState(0);

  // Dynamic card design dictionary from creditCards state + fallback
  const cardDesigns = useMemo(() => {
    const designs: { [key: string]: { name: string; issuer: string; gradient: string; theme: string; chipColor: string; accent: string } } = {
      "All": {
        name: "Aggregated Portfolio",
        issuer: "FINSECURE HUB",
        gradient: "from-indigo-650 via-purple-705 to-indigo-900",
        theme: "dark",
        chipColor: "bg-amber-300",
        accent: "border-purple-300/30",
      },
    };

    creditCards.forEach((c) => {
      designs[c.last4] = {
        name: c.name,
        issuer: c.issuer,
        gradient: c.gradient,
        theme: c.theme,
        chipColor: c.chipColor,
        accent: c.accent,
      };
    });

    return designs;
  }, [creditCards]);

  // Aggregate stats dynamically
  const cardDataList = useMemo(() => {
    const expenseSums: { [key: string]: number } = {};
    const transactionCounts: { [key: string]: number } = {};

    // Base card identifiers
    const BASE_IDS = (creditCards || []).filter((c) => c && c.last4).map((c) => c.last4);
    BASE_IDS.forEach((id) => {
      expenseSums[id] = 0;
      transactionCounts[id] = 0;
    });

    // Populate transaction accumulations
    transactions.forEach((t) => {
      if (!t) return;
      const last = t.cardLast4 || "OFFL";
      if (t.category !== "Income") {
        expenseSums[last] = (expenseSums[last] || 0) + (Number(t.amount) || 0);
        transactionCounts[last] = (transactionCounts[last] || 0) + 1;
      }
    });

    // Merge standard base ones + dynamic parsed email card references
    const activeLast4s = Array.from(new Set([
      ...BASE_IDS,
      ...Object.keys(expenseSums)
    ])).filter((id) => {
      if (!id) return false;
      if (!BASE_IDS.includes(id) && (expenseSums[id] || 0) === 0) {
        return false;
      }
      return true;
    });

    const totalSpent = transactions
      .filter((t) => t && t.category !== "Income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const pool = [
      {
        last4: "All",
        spent: totalSpent,
        count: transactions.filter((t) => t && t.category !== "Income").length,
        design: cardDesigns["All"] || {
          name: "Aggregated Portfolio",
          issuer: "FINSECURE HUB",
          gradient: "from-indigo-650 via-purple-705 to-indigo-900",
          theme: "dark",
          chipColor: "bg-amber-300",
          accent: "border-purple-300/30",
        },
      },
      ...activeLast4s.map((l4) => {
        if (!l4) return null;
        const design = cardDesigns[l4] || {
          name: `${l4.toUpperCase()} Card Account`,
          issuer: "PARTNER INST",
          gradient: "from-blue-900 via-indigo-950 to-cyan-950",
          theme: "dark",
          chipColor: "bg-slate-400",
          accent: "border-indigo-400/20",
        };

        return {
          last4: l4,
          spent: expenseSums[l4] || 0,
          count: transactionCounts[l4] || 0,
          design,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null)
    ];

    return pool;
  }, [transactions, creditCards, cardDesigns]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !cardName || last4.length !== 4 || isNaN(Number(last4))) {
      return;
    }

    const preset = PRESETS[selectedGradientIdx];
    onAddCreditCard({
      name: cardName,
      issuer: bankName.toUpperCase(),
      last4: last4,
      gradient: preset.value,
      theme: "dark",
      chipColor: preset.chipColor,
      accent: "border-white/10",
      limit: Number(limit) || 150000,
    });

    // Reset fields
    setBankName("");
    setCardName("");
    setLast4("");
    setLimit("");
    setSelectedGradientIdx(0);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 uppercase tracking-wide">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Display Card Accounts Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Select any card below to filter metrics, charts & history to that account, or show dynamic aggregated totals
          </p>
        </div>
        {selectedCard !== "All" && (
          <button
            onClick={() => onSelectCard("All")}
            className="text-[10px] font-black text-blue-605 hover:text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full cursor-pointer transition flex items-center gap-1"
          >
            <Layers className="w-3 h-3" /> Show All Cards
          </button>
        )}
      </div>

      {/* Horizontal scrolling visual credit cards deck */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {cardDataList.map((card) => {
          if (!card) return null;
          const isSelected = selectedCard === card.last4;
          const cardDesign = card.design || {
            name: "Card Account",
            issuer: "PARTNER INST",
            gradient: "from-blue-900 via-indigo-950 to-cyan-950",
            theme: "dark",
            chipColor: "bg-slate-400",
            accent: "border-indigo-400/20",
          };

          return (
            <div
              key={card.last4 || "unknown"}
              onClick={() => onSelectCard(card.last4)}
              className={`w-72 h-44 rounded-2xl bg-gradient-to-br ${cardDesign.gradient || "from-slate-900 to-black"} p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? "ring-4 ring-blue-500 ring-offset-2 scale-[1.01] shadow-xl" 
                  : "opacity-80 hover:opacity-100 border border-slate-750 hover:scale-[1.005]"
              }`}
            >
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none transform rotate-45"></div>

              {/* Upper Section */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-300/80 font-black font-mono">
                    {cardDesign.issuer || "PARTNER INST"}
                  </p>
                  <h4 className="text-[11px] font-bold text-white tracking-wide mt-0.5">
                    {cardDesign.name || "Credit Account"}
                  </h4>
                </div>
                <div className="flex flex-col items-end">
                  <Shield className="w-4 h-4 text-white/40" />
                  <span className="text-[8px] text-white/50 uppercase tracking-widest font-bold mt-1 font-mono">
                    Active
                  </span>
                </div>
              </div>

              {/* Middle Section: Chip and Numbers */}
              <div className="flex items-center gap-3.5 mt-2.5 relative z-10">
                <div className={`w-8 h-6 rounded ${cardDesign.chipColor || "bg-amber-300"} opacity-75 relative flex items-center justify-center overflow-hidden border border-white/10`}>
                  <div className="grid grid-cols-3 gap-0.5 w-6 h-4 opacity-30">
                    <div className="border-r border-b border-black"></div>
                    <div className="border-r border-b border-black"></div>
                    <div className="border-b border-black"></div>
                    <div className="border-r border-black"></div>
                    <div className="border-r border-black"></div>
                    <div></div>
                  </div>
                </div>

                <p className="text-sm font-black font-mono tracking-widest text-slate-200">
                  •••• •••• •••• {(card.last4 || "OFFL").toUpperCase()}
                </p>
              </div>

              {/* Bottom Section: Spend summary */}
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/50 font-bold font-mono">
                    {card.last4 === "All" ? "Combined Spent" : "Card Cycle Spend"}
                  </p>
                  <p className="text-base font-black font-mono text-white mt-0.5 animate-pulse-once">
                    ₹{card.spent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-widest text-white/50 font-bold font-mono">
                    Transactions
                  </p>
                  <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-md text-white">
                    {card.count} {card.count === 1 ? "Tx" : "Txs"}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-3.5 right-4 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              )}
            </div>
          );
        })}

        {/* Dash Board "+" Add card card slider item */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="w-72 h-44 rounded-2xl border-2 border-dashed border-slate-350 bg-white/60 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 group flex-shrink-0 cursor-pointer transition-all duration-300 text-slate-550 select-none"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300">
            <Plus className="w-5 h-5 text-blue-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-wide">Add Issuer Credit Card</span>
          <span className="text-[10px] text-slate-400 font-medium">Add card dynamic cycle limits</span>
        </div>
      </div>

      {/* Slide-In Modal Form to add Credit Cards */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-md text-left shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-950 uppercase tracking-wide">Register New Credit Card</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Interactive Card Preview */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Design Preview</p>
              <div className={`w-full h-40 rounded-2xl bg-gradient-to-br ${PRESETS[selectedGradientIdx].value} p-5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300`}>
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none transform rotate-45"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-300/80 font-black font-mono">
                      {bankName.trim() ? bankName.toUpperCase() : "ISSUER BANK"}
                    </p>
                    <h4 className="text-[11px] font-bold text-white tracking-wide mt-0.5">
                      {cardName.trim() ? cardName : "Card Product Name"}
                    </h4>
                  </div>
                  <Shield className="w-4 h-4 text-white/40" />
                </div>

                <div className="flex items-center gap-3.5 mt-2 relative">
                  <div className={`w-8 h-6 rounded ${PRESETS[selectedGradientIdx].chipColor} opacity-75 relative flex items-center justify-center border border-white/10`}>
                    <div className="grid grid-cols-3 gap-0.5 w-6 h-4 opacity-30">
                      <div className="border-r border-b border-black"></div>
                      <div className="border-b border-black"></div>
                      <div></div>
                    </div>
                  </div>
                  <p className="text-sm font-black font-mono tracking-widest text-slate-200">
                    •••• •••• •••• {last4.trim() ? last4.padEnd(4, "•") : "••••"}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-white/50 font-bold font-mono">Credit Limit</p>
                    <p className="text-sm font-black font-mono text-white mt-0.5">
                      ₹{(Number(limit) || 150000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded text-white font-mono uppercase">
                    CREDIT
                  </span>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Issuer Bank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AXIS BANK, AMEX"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-850 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Card Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlas, Gold Charge"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-850 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Last 4 Digits</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. 3012"
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-850 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Credit Limit (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-550 focus:outline-none rounded-xl py-2 px-3 text-xs text-slate-850 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Gradient Presets Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Choose Card Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSelectedGradientIdx(idx)}
                      className={`h-11 rounded-xl bg-gradient-to-br ${p.value} flex items-center justify-center cursor-pointer border hover:-translate-y-0.5 transition-all text-white ${
                        selectedGradientIdx === idx ? "border-blue-500 ring-2 ring-blue-550 border-white" : "border-slate-200"
                      }`}
                      title={p.label}
                    >
                      {selectedGradientIdx === idx && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-md transition"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white/10" /> Submit Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
