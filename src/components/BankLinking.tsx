import React, { useState } from "react";
import { CreditCard, Database, ShieldCheck, Link2, Plus, Check, RefreshCw, KeyRound, Smartphone, Lock } from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  last4: string;
  balance: number;
  type: "checking" | "credit" | "savings";
  status: "connected" | "sync_error" | "re-auth";
}

export const BankLinking: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: "bk-1",
      name: "Preferred Salary Savings",
      bankName: "HDFC Bank",
      last4: "4092",
      balance: 145250.00,
      type: "checking",
      status: "connected",
    },
    {
      id: "bk-2",
      name: "Regalia Credit Card",
      bankName: "HDFC Card API",
      last4: "9512",
      balance: 12423.50,
      type: "credit",
      status: "connected",
    },
    {
      id: "bk-3",
      name: "Amazon Pay Credit Card",
      bankName: "ICICI API",
      last4: "4921",
      balance: 2423.50,
      type: "credit",
      status: "connected",
    },
    {
      id: "bk-4",
      name: "Reserved High Yield Account",
      bankName: "SBI Savings Bank",
      last4: "7749",
      balance: 285000.00,
      type: "savings",
      status: "connected",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // Account Aggregator state machine steps
  const [otpSent, setOtpSent] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || mobileNumber.length < 10) return;

    setIsLinking(true);
    // Simulate API calling Account Aggregator protocol (Anumati/CAMS) to dispatch OTP
    setTimeout(() => {
      setIsLinking(false);
      setOtpSent(true);
    }, 1200);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) return;

    setIsLinking(true);
    // Simulate secure handshakes verifying OTP signatures
    setTimeout(() => {
      const generatedLast4 = Math.floor(1000 + Math.random() * 9000).toString();
      const newAcc: BankAccount = {
        id: `bk-${Date.now()}`,
        name: `${selectedBank.replace(" (AA)", "")} High-Tier Plus`,
        bankName: `${selectedBank} AA Link`,
        last4: generatedLast4,
        balance: Math.floor(45000 + Math.random() * 180000),
        type: Math.random() > 0.4 ? "checking" : "credit",
        status: "connected",
      };

      setAccounts((prev) => [newAcc, ...prev]);
      setIsLinking(false);
      setLinkSuccess(true);

      // Slide close modal after success banner triggers
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedBank("");
        setMobileNumber("");
        setOtpCode("");
        setOtpSent(false);
        setLinkSuccess(false);
      }, 1805);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-805">
      {/* Linked Accounts List (Col 2) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-900">Linked Bank Connections</h3>
            <p className="text-xs text-slate-500">Direct integration channels with primary Indian credit partners and deposit checking pools</p>
          </div>

          <button
            onClick={() => {
              setOtpSent(false);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" /> Connect Bank Account
          </button>
        </div>

        {/* List of active banks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group text-left">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-[10px] font-extrabold font-mono text-blue-600 uppercase tracking-widest">{acc.bankName}</h4>
                  <h5 className="text-sm font-bold text-slate-900 mt-0.5">{acc.name}</h5>
                  <span className="text-[10px] text-slate-400 font-bold font-mono bg-slate-200/50 px-2 py-0.5 rounded">Mapped Account: •••• {acc.last4}</span>
                </div>

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  acc.type === "credit" ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-blue-50 border-blue-105 text-blue-600"
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-205/60">
                <span className="text-xs font-semibold text-slate-400">{acc.type === "credit" ? "Current Dues" : "Available Funds"}</span>
                <span className="text-lg font-black font-mono text-slate-950">
                  ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Verified Badge */}
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-850 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50 w-fit shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SECURED BY RBI ACCOUNT AGGREGATOR (AA-CONSENT)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Architecture details (Col 1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 self-start text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900">Integration Security Protocols</h3>
          <p className="text-xs text-slate-500">Multi-Factor bank credential authentication schemas</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs text-slate-650">
          <div className="flex items-center gap-2 text-blue-650 font-black text-[10px] uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue-605" /> RBI Account Aggregator Framework
          </div>
          
          <p className="leading-relaxed font-bold">
            All banking endpoints sync through RBI-approved Account Aggregator models and tokenized credit statement decoders.
          </p>

          <p className="leading-relaxed border-t border-slate-200 pt-2.5 font-medium">
            Your login parameters (like passwords and custom userIDs) are **never** requested. This app uses secure, tokenized mobile consent frameworks matching standard CRED and Paytm integrations securely.
          </p>
        </div>
      </div>

      {/* Cred/Paytm style Simulated Linking Modal (No usernames/passwords!) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-155">
            <div className="flex items-center justify-center gap-2 text-blue-600 font-extrabold text-[10px] uppercase tracking-wider mb-4 border border-blue-200/80 w-fit mx-auto px-2.5 py-0.5 rounded-full bg-blue-50">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-550" />
              <span>RBI Account Aggregator Linking</span>
            </div>

            {linkSuccess ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-950">Active Consent Authorized!</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Tokenized permissions established successfully. Fetching balance and card accounts registries safely...
                </p>
              </div>
            ) : !otpSent ? (
              /* Step 1: Input Mob and Bank */
              <div className="space-y-4 text-left">
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-950 mb-1">Credential-Free Connection</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mb-4">
                    Connect accounts securely using your mobile number registered with the bank. No usernames or passwords required.
                  </p>
                </div>

                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">Select Bank Partner</label>
                    <select
                      required
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-550 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold"
                    >
                      <option value="">-- Select Bank partner --</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">Registered Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        pattern="\d{10}"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-550 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 font-bold font-mono tracking-wide"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer w-1/2 font-semibold bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLinking || !selectedBank || mobileNumber.length < 10}
                      className="text-white font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition cursor-pointer w-1/2 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {isLinking ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> Dispatched...
                        </>
                      ) : (
                        <>
                          Request OTP
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Step 2: Input OTP */
              <div className="space-y-4 text-left">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950 mb-1">Enter Consent OTP</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    A secure 6-digit confirmation code was sent to <strong className="text-slate-900 font-bold">XXXXX XX{mobileNumber.slice(-3)}</strong> under the RBI AA framework.
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">Verification OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit code (e.g. 195028)"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-550 rounded-xl py-2 px-3 text-center text-sm text-slate-900 font-black tracking-widest font-mono"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer w-1/2 font-semibold bg-white"
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLinking || otpCode.length < 4}
                      className="text-white font-bold px-4 py-2 rounded-xl bg-blue-650 hover:bg-blue-700 transition cursor-pointer w-1/2 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {isLinking ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> Aligning...
                        </>
                      ) : (
                        <>
                          Confirm AA
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
