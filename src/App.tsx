import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  initAuth, googleSignIn, logout, getAccessToken 
} from "./auth";
import { fetchAndSyncGmailTransactions } from "./gmailService";
import { 
  INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_ALERTS, INITIAL_GOALS 
} from "./initialData";
import { Transaction, Budget, BillPaymentAlert, Goal, CreditCardAccount } from "./types";
import { Header } from "./components/Header";
import { MetricCards } from "./components/MetricCards";
import { CustomDashboard } from "./components/CustomDashboard";
import { BudgetsPanel } from "./components/BudgetsPanel";
import { MilestonesPanel } from "./components/MilestonesPanel";
import { ReportGenerator } from "./components/ReportGenerator";
import { ManualOfflineEntry } from "./components/ManualOfflineEntry";
import { BankLinking } from "./components/BankLinking";
import { BiometricVerify } from "./components/BiometricVerify";
import { CardsSlider } from "./components/CardsSlider";

import { 
  LayoutDashboard, PiggyBank, Receipt, FileBarChart, CreditCard, 
  Settings, Bell, AlertTriangle, ShieldCheck, Wifi, RefreshCw, X 
} from "lucide-react";

export default function App() {
  // Navigation Routing states
  const [activeTab, setActiveTab] = useState<"dashboard" | "budgets" | "goals" | "manual" | "bank" | "reports">("dashboard");
  
  // Authenticated State hooks
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Financial Datasets (initialized from localStorage or falling back to premium samples)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem("fin_transactions");
    return cached ? JSON.parse(cached) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const cached = localStorage.getItem("fin_budgets");
    return cached ? JSON.parse(cached) : INITIAL_BUDGETS;
  });

  const [alerts, setAlerts] = useState<BillPaymentAlert[]>(() => {
    const cached = localStorage.getItem("fin_alerts");
    return cached ? JSON.parse(cached) : INITIAL_ALERTS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const cached = localStorage.getItem("fin_goals");
    return cached ? JSON.parse(cached) : INITIAL_GOALS;
  });

  // Credit Card Accounts State
  const [creditCards, setCreditCards] = useState<CreditCardAccount[]>(() => {
    const cached = localStorage.getItem("fin_credit_cards");
    if (cached) return JSON.parse(cached);
    return [
      {
        id: "cc-4921",
        name: "Infinia Super Premium",
        issuer: "HDFC BANK",
        last4: "4921",
        gradient: "from-slate-950 via-zinc-900 to-neutral-950",
        theme: "dark",
        chipColor: "bg-yellow-500",
        accent: "border-yellow-500/20",
        limit: 500000,
      },
      {
        id: "cc-7749",
        name: "Sapphiro Select",
        issuer: "ICICI BANK",
        last4: "7749",
        gradient: "from-indigo-950 via-blue-900 to-slate-800",
        theme: "dark",
        chipColor: "bg-slate-300",
        accent: "border-sky-500/20",
        limit: 300050,
      },
      {
        id: "cc-1092",
        name: "SimplyCLICK Advantage",
        issuer: "SBI CARD",
        gradient: "from-emerald-950 via-teal-950 to-neutral-950",
        theme: "dark",
        chipColor: "bg-yellow-600",
        accent: "border-emerald-500/20",
        limit: 200000,
      },
      {
        id: "cc-offl",
        name: "Manual Cache Registry",
        issuer: "LOCAL SECURE",
        last4: "OFFL",
        gradient: "from-amber-950 via-stone-900 to-orange-950",
        theme: "dark",
        chipColor: "bg-amber-400",
        accent: "border-amber-500/20",
        limit: 100000,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("fin_credit_cards", JSON.stringify(creditCards));
  }, [creditCards]);

  const handleAddCreditCard = (card: Omit<CreditCardAccount, "id">) => {
    if (creditCards.some((c) => c.last4 === card.last4)) {
      showToast(`Credit Card with matching digits (*${card.last4}) is already registered!`, "alert");
      return;
    }
    const newCard: CreditCardAccount = {
      ...card,
      id: `cc-${Date.now()}`,
    };
    setCreditCards((prev) => [...prev, newCard]);
    showToast(`Successfully registered custom card ${card.name} with last 4: *${card.last4}!`, "success");
  };

  // Connection & Offline Simulator States
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncingOfflinePool, setIsSyncingOfflinePool] = useState(false);
  const [isGmailSyncing, setIsGmailSyncing] = useState(false);
  const [gmailProgress, setGmailProgress] = useState("");

  // Biometrics simulation states
  const [biometricActive, setBiometricActive] = useState(() => {
    return localStorage.getItem("biometric_enforce") === "true";
  });
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioAction, setBioAction] = useState<"setup" | "verify">("verify");
  const [pendingTabTransition, setPendingTabTransition] = useState<any>(null);

  // Card filter state
  const [selectedCard, setSelectedCard] = useState<string>("All");

  // Dark mode global theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("fin_dark_mode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("fin_dark_mode", String(darkMode));
  }, [darkMode]);

  // Notifications/Toasts alerts feed
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "alert" | "success" | "info" }[]>([]);

  // Persistent synchronizations trigger
  useEffect(() => {
    localStorage.setItem("fin_transactions", JSON.stringify(transactions));
    // Recalculate budgets spent on any transaction updates
    const updatedBudgets = budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.category === b.category && t.category !== "Income")
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent };
    });
    localStorage.setItem("fin_budgets", JSON.stringify(updatedBudgets));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("fin_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("fin_goals", JSON.stringify(goals));
  }, [goals]);

  // Auth Listener configuration
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        showToast("Access token established securely with Gmail permssions", "success");
      },
      () => {
        // Auth failed or token cleared
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Alert notifier trigger
  const showToast = (message: string, type: "alert" | "success" | "info" = "info") => {
    const fresh: any = { id: `${Date.now()}-${Math.random()}`, message, type };
    setToasts((prev) => [...prev, fresh]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== fresh.id));
    }, 5000);
  };

  // Google Login popup
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showToast(`Secure Gmail Connection complete! Authenticated as ${result.user.displayName}`, "success");
        // Pull Gmail immediately
        triggerGmailSync(result.accessToken);
      }
    } catch (e: any) {
      console.error(e);
      showToast("Access declined. Could not pair Gmail credentials.", "alert");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    showToast("Cleared paired API access tokens from memory.", "info");
  };

  // Gmail Parsing synchronizer
  const triggerGmailSync = async (accessTokenToUse?: string) => {
    const activeToken = accessTokenToUse || token;
    if (!activeToken) {
      showToast("Please tap 'Enable Gmail Live Sync' first to supply credentials.", "info");
      return;
    }

    setIsGmailSyncing(true);
    setGmailProgress("Accessing Gmail inbox stream...");
    try {
      const freshTxs = await fetchAndSyncGmailTransactions(activeToken, (update) => {
        setGmailProgress(update);
      });

      if (freshTxs.length > 0) {
        // Discard duplicates base on emailId reference
        setTransactions((prev) => {
          const filteredPrev = prev.filter((t) => !freshTxs.some((f) => f.id === t.id));
          return [...filteredPrev, ...freshTxs];
        });
        showToast(`Successfully synchronized & categorized ${freshTxs.length} Gmail credit receipts using machine learning.`, "success");
      } else {
        showToast("Scanning index complete. No unrecognized transaction vouchers inside Gmail.", "info");
      }
    } catch (error: any) {
      console.error(error);
      showToast(`Sync failed: ${error.message || "Intermittent Network Timeout."}`, "alert");
    } finally {
      setIsGmailSyncing(false);
      setGmailProgress("");
    }
  };

  // Manual transaction addition
  const handleAddTransaction = (
    merchant: string,
    amount: number,
    date: string,
    category: string,
    offlineModeState: boolean
  ) => {
    const fresh: Transaction = {
      id: `tx-${Date.now()}`,
      merchant,
      amount,
      date,
      category: category as any,
      cardLast4: "OFFL",
      source: "manual",
      status: offlineModeState ? "pending_sync" : "cleared",
    };

    setTransactions((prev) => [fresh, ...prev]);
    showToast(
      offlineModeState 
        ? `Added locally to offline queue! Placed safely in device cache.` 
        : `Stored transaction and saved to ledger.`, 
      offlineModeState ? "info" : "success"
    );
  };

  // Budget Adjuster
  const handleUpdateLimit = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
    showToast(`Updated budget limit for ${category} to $${newLimit}`, "success");
  };

  // Bill payment triggers
  const handleAddBillAlert = (title: string, dueDate: string, amount: number, category: string) => {
    const alert: BillPaymentAlert = {
      id: `al-${Date.now()}`,
      title,
      dueDate,
      amount,
      category,
      status: "upcoming",
    };
    setAlerts((prev) => [alert, ...prev]);
    showToast(`Set bill alert reminder: '${title}' due on ${dueDate}`, "success");
  };

  const handleMarkAlertPaid = (id: string) => {
    setAlerts((prev) =>
      prev.map((al) => (al.id === id ? { ...al, status: "paid" } : al))
    );
    showToast("Bill marked as paid! Budget updated accordingly.", "success");
  };

  // Target Goal Setups
  const handleAddGoal = (
    name: string,
    cardName: string,
    type: "annual_spend" | "quarterly_spend" | "monthly_spend" | "transaction_count",
    target: number,
    targetCount: number,
    deadline: string,
    rewardDescription: string
  ) => {
    const fresh: Goal = {
      id: `gl-${Date.now()}`,
      name,
      cardName,
      type,
      target,
      targetCount: type === "transaction_count" ? targetCount : undefined,
      deadline,
      rewardDescription,
      completed: false
    };

    setGoals((prev) => [fresh, ...prev]);
    showToast(`Created Card Milestone: '${name}' target: ₹${target}`, "success");
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showToast("Archived Milestone Track.", "info");
  };

  // Switch and trigger offline reconciliation
  const handleToggleOffline = () => {
    if (isOffline) {
      // Transitioning to ONLINE
      setIsOffline(false);
      const pendingTxs = transactions.filter((t) => t.status === "pending_sync");
      if (pendingTxs.length > 0) {
        setIsSyncingOfflinePool(true);
        showToast("Pairing network tunnel... Reconciling offline SQLite changes...", "info");

        setTimeout(() => {
          setTransactions((prev) =>
            prev.map((t) => (t.status === "pending_sync" ? { ...t, status: "cleared" } : t))
          );
          setIsSyncingOfflinePool(false);
          showToast(`Offline mode sync complete. Securely posted ${pendingTxs.length} manual records to main ledger!`, "success");
        }, 2200);
      } else {
        showToast("Synchronized successfully. Local buffer is empty.", "success");
      }
    } else {
      // Transitioning to OFFLINE
      setIsOffline(true);
      showToast("Tunnel detached. Entering Local Storage SQLite Cache protocol.", "info");
    }
  };

  // Biometrics handler intercept
  const handleTabClick = (tab: typeof activeTab) => {
    if (biometricActive && (tab === "reports" || tab === "bank")) {
      setPendingTabTransition(tab);
      setBioAction("verify");
      setIsBioModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleBiometricTrigger = () => {
    if (biometricActive) {
      setBiometricActive(false);
      localStorage.setItem("biometric_enforce", "false");
      showToast("Biometric verification layer disabled.", "info");
    } else {
      setBioAction("setup");
      setIsBioModalOpen(true);
    }
  };

  const handleBiometricModalSuccess = () => {
    if (bioAction === "setup") {
      setBiometricActive(true);
      localStorage.setItem("biometric_enforce", "true");
      showToast("Biometric geometry enrolled successfully! Secure KeyChain paired.", "success");
    } else if (bioAction === "verify") {
      showToast("Identity verified. Decrypting financial endpoints...", "success");
      if (pendingTabTransition) {
        setActiveTab(pendingTabTransition);
        setPendingTabTransition(null);
      }
    }
  };

  // Aggregate stats
  const budgetTotal = budgets.reduce((acc, b) => acc + b.limit, 0);
  const pendingOfflineCount = transactions.filter((t) => t.status === "pending_sync").length;

  const filteredTransactionsByCard = selectedCard === "All"
    ? transactions
    : transactions.filter(t => t && t.cardLast4 === selectedCard);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none selection:bg-blue-500/10 selection:text-blue-700">
      {/* Header component */}
      <Header
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        isGmailSynced={!!token}
        isSyncing={isGmailSyncing}
        lastSyncedAt="May 23, 2026"
        onSyncGmail={() => triggerGmailSync()}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        biometricActive={biometricActive}
        onTriggerBiometric={handleBiometricTrigger}
        hasCachedChanges={pendingOfflineCount > 0}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Gmail Synced Progress Panel */}
      <AnimatePresence>
        {isGmailSyncing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 border-b border-blue-100 text-blue-700 py-3.5 px-6 font-mono text-xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Gmail Live Sync Service active: <strong className="text-slate-950 font-black">{gmailProgress}</strong></span>
            </div>
            <div className="hidden md:block text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
              ML Receipt Analysis Thread
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconciling Loader bar */}
      <AnimatePresence>
        {isSyncingOfflinePool && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 border-b border-amber-200 text-amber-800 py-4 px-6 text-xs text-center border-dashed font-mono"
          >
            <div className="max-w-md mx-auto flex flex-col items-center gap-2">
              <span className="animate-pulse font-bold">Pushing cached manual transactions to remote ledger cloud clusters...</span>
              <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden mt-1.5">
                <div className="h-full bg-amber-500 animate-[pulse_1.5s_infinite]" style={{ width: "100%" }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1.5 lg:pb-0 scrollbar-none">
          <button
            onClick={() => handleTabClick("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-700 shadow-sm border-l-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span>Overview Hub</span>
          </button>

          <button
            onClick={() => handleTabClick("manual")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              activeTab === "manual"
                ? "bg-blue-50 text-blue-700 shadow-sm border-l-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Receipt className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Manual Log</span>
            {pendingOfflineCount > 0 && (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
                {pendingOfflineCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick("budgets")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              activeTab === "budgets"
                ? "bg-blue-50 text-blue-705 shadow-sm border-l-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            <span>Budgets & Alarms</span>
          </button>

          <button
            onClick={() => handleTabClick("goals")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              activeTab === "goals"
                ? "bg-blue-50 text-blue-700 shadow-sm border-l-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <PiggyBank className="w-5 h-5 flex-shrink-0" />
            <span>Goals & Milestones</span>
          </button>

          <button
            onClick={() => handleTabClick("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              activeTab === "reports"
                ? "bg-blue-50 text-blue-700 shadow-sm border-l-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileBarChart className="w-5 h-5 flex-shrink-0" />
            <span>Monthly Reports</span>
          </button>

          <button
            onClick={() => handleTabClick("bank")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition ${
              activeTab === "bank"
                ? "bg-blue-50 text-blue-700 shadow-sm border-l-2 border-blue-600 font-extrabold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <span>Linked Banks</span>
          </button>
        </aside>

        {/* Dynamic Panel Workspace */}
        <section className="flex-1 min-w-0 space-y-6">
          {/* Global financial stats on overview headers */}
          {activeTab === "dashboard" && (
            <>
              <CardsSlider
                transactions={transactions}
                creditCards={creditCards}
                onAddCreditCard={handleAddCreditCard}
                selectedCard={selectedCard}
                onSelectCard={setSelectedCard}
              />
              <MetricCards transactions={filteredTransactionsByCard} monthlyBudgetTotal={budgetTotal} />
            </>
          )}

          {/* Render Active View tab */}
          <div className="focus:outline-none">
            {activeTab === "dashboard" && (
              <CustomDashboard
                transactions={filteredTransactionsByCard}
                onOpenAddManual={() => setActiveTab("manual")}
                onRefresh={() => triggerGmailSync()}
                isSyncing={isGmailSyncing}
              />
            )}

            {activeTab === "manual" && (
              <ManualOfflineEntry
                onAddTransaction={handleAddTransaction}
                isOffline={isOffline}
                onToggleOffline={handleToggleOffline}
                pendingSyncCount={pendingOfflineCount}
                creditCards={creditCards}
              />
            )}

            {activeTab === "budgets" && (
              <BudgetsPanel
                budgets={budgets}
                alerts={alerts}
                onUpdateLimit={handleUpdateLimit}
                onAddAlert={handleAddBillAlert}
                onMarkAlertPaid={handleMarkAlertPaid}
              />
            )}

            {activeTab === "goals" && (
              <MilestonesPanel
                goals={goals}
                transactions={transactions}
                creditCards={creditCards}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {activeTab === "reports" && (
              <ReportGenerator
                transactions={transactions}
                budgets={budgets}
                userEmail={user?.email || "guest@sandbox.dev"}
              />
            )}

            {activeTab === "bank" && <BankLinking />}
          </div>
        </section>
      </main>

      {/* Floating alert notification toaster */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-bold border shadow-2xl relative overflow-hidden ${
                t.type === "alert"
                  ? "bg-red-50 text-red-900 border-red-200 shadow-xl"
                  : t.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-xl"
                  : "bg-white text-slate-800 border-slate-200 shadow-xl"
              }`}
            >
              <div className="flex-1">{t.message}</div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-slate-900 transition"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Biometric Verification Dialog Overlay */}
      <BiometricVerify
        isOpen={isBioModalOpen}
        onClose={() => {
          setIsBioModalOpen(false);
          setPendingTabTransition(null);
        }}
        onSuccess={handleBiometricModalSuccess}
        actionTheme={bioAction}
      />
    </div>
  );
}
