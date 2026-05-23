import React from "react";
import { User } from "firebase/auth";
import { ShieldCheck, Wifi, WifiOff, RefreshCw, Mail, LogIn, LogOut, CheckCircle2, Sun, Moon } from "lucide-react";

interface HeaderProps {
  user: User | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isGmailSynced: boolean;
  isSyncing: boolean;
  lastSyncedAt?: string;
  onSyncGmail: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  biometricActive: boolean;
  onTriggerBiometric: () => void;
  hasCachedChanges: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggingIn,
  onLogin,
  onLogout,
  isGmailSynced,
  isSyncing,
  lastSyncedAt,
  onSyncGmail,
  isOffline,
  onToggleOffline,
  biometricActive,
  onTriggerBiometric,
  hasCachedChanges,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 py-4 px-6 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <div className="w-4.5 h-4.5 border-2 border-white rotate-45"></div>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">FinTrack Pro</h1>
            <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
              <span>Smart Credit & Budgeting</span>
              <span className="text-slate-300">•</span>
              <button
                onClick={onToggleOffline}
                className={`flex items-center gap-1.5 text-[10px] font-bold transition px-2 py-0.5 rounded-full border cursor-pointer ${
                  isOffline
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
                title={isOffline ? "Switch to Online Mode" : "Activate Offline Simulation"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
                {isOffline ? "Offline Mode Client" : "Live Sync: Bank APIs"}
              </button>
              {hasCachedChanges && (
                <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  Unsynced Drafts
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end w-full md:w-auto">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-350 text-slate-600 transition duration-200 cursor-pointer shadow-sm"
            title={darkMode ? "Activate Light Mode" : "Activate Dark Mode"}
          >
            {darkMode ? (
              <Sun className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-blue-600 fill-blue-600/10" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </button>

          {/* Biometrics Toggle Indicator */}
          <button
            onClick={onTriggerBiometric}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer border ${
              biometricActive
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${biometricActive ? "text-blue-600 fill-blue-500/10" : "text-slate-400"}`} />
            <span className="hidden sm:inline">Secure Mode</span>
            <span className={`w-1.5 h-1.5 rounded-full ${biometricActive ? "bg-blue-600" : "bg-slate-300"}`}></span>
          </button>

          {/* Gmail OAuth Activation button */}
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onSyncGmail}
                disabled={isSyncing || isOffline}
                className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin animate-infinite" : ""}`} />
                <span>{isSyncing ? "Extracting..." : "Sync Gmail"}</span>
              </button>

              <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" className="w-8.5 h-8.5 rounded-full border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-8.5 h-8.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 max-w-[120px] truncate leading-tight">{user.displayName || "Alex Chen"}</p>
                  <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-wide leading-none mt-0.5">Premium Plan</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn || isOffline}
              className="flex items-center gap-2.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span>{isLoggingIn ? "Connecting..." : "Enable Gmail Live Sync"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
