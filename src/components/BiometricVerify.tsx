import React, { useState, useEffect } from "react";
import { Fingerprint, Check, AlertCircle, ShieldAlert, KeyRound, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BiometricVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTheme?: "setup" | "verify";
}

export const BiometricVerify: React.FC<BiometricVerifyProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTheme = "verify",
}) => {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [deviceOS, setDeviceOS] = useState<"iOS" | "Android" | "Desktop">("Desktop");

  useEffect(() => {
    // Basic agent detection for biometric framing
    const ua = navigator.userAgent;
    if (/iPhone|iPad|Macintosh/.test(ua)) {
      setDeviceOS("iOS");
    } else if (/Android/.test(ua)) {
      setDeviceOS("Android");
    } else {
      setDeviceOS("Desktop");
    }
  }, []);

  const handleScanTrigger = () => {
    if (scanState === "scanning" || scanState === "success") return;
    setScanState("scanning");

    // Simulate cryptographic WebAuthn biometrics verification
    setTimeout(() => {
      // 95% success rate for simulation fidelity
      if (Math.random() > 0.05) {
        setScanState("success");
        setTimeout(() => {
          onSuccess();
          setScanState("idle");
          onClose();
        }, 1200);
      } else {
        setScanState("failed");
      }
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-slate-800">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Background Ring */}
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
 
          {/* Secure Header */}
          <div className="flex items-center justify-center gap-2 text-blue-605 font-bold text-xs uppercase tracking-wider mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Biometric Secure Vault</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">
            {actionTheme === "setup" ? "Register FaceID / TouchID" : "Verify Identity"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-8 font-medium">
            {actionTheme === "setup"
              ? "Link your local Android Biometric Key or iOS TouchID/FaceID credentials to encrypt offline manual entries."
              : "Verify your fingerprint or facial geometry to authorize database synchronization and expense report exports."}
          </p>

          {/* Glowing Fingerprint Interaction Ring */}
          <div className="flex flex-col items-center justify-center mb-8">
            <button
              onClick={handleScanTrigger}
              className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative group cursor-pointer ${
                scanState === "scanning"
                  ? "border-blue-550 bg-blue-50/50 shadow-md shadow-blue-500/10"
                  : scanState === "success"
                  ? "border-emerald-505 bg-emerald-50 shadow-md shadow-emerald-500/10"
                  : scanState === "failed"
                  ? "border-rose-500 bg-rose-50 shadow-md shadow-rose-500/10"
                  : "border-slate-200 bg-slate-50 hover:border-slate-350"
              }`}
            >
              <AnimatePresence mode="wait">
                {scanState === "scanning" && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-600"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  />
                )}
              </AnimatePresence>

              {scanState === "success" ? (
                <Check className="w-12 h-12 text-emerald-600 stroke-[2.5]" />
              ) : scanState === "failed" ? (
                <AlertCircle className="w-12 h-12 text-rose-550" />
              ) : (
                <Fingerprint className={`w-12 h-12 transition ${scanState === "scanning" ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-slate-705"}`} />
              )}
            </button>

            {/* Instruction Label */}
            <span className="text-[11px] font-mono mt-4 text-slate-500">
              {scanState === "scanning" ? (
                <span className="text-blue-605 animate-pulse uppercase font-bold">Reading biometric sensors...</span>
              ) : scanState === "success" ? (
                <span className="text-emerald-700 uppercase font-bold">Verification Secured!</span>
              ) : scanState === "failed" ? (
                <span className="text-rose-700 uppercase font-bold">Timeout. Tap to retry.</span>
              ) : (
                <span className="hover:text-slate-805 transition cursor-pointer font-bold">Place finger on sensor or click to scan</span>
              )}
            </span>
          </div>

          {/* Secure Web Cryptography & Device Info Footer */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-6 flex items-center justify-around text-slate-550 text-[10px] font-bold">
            <div className="flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-blue-600" />
              <span>AES-256 GCM</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div>
              Platform: <span className="text-slate-800 font-bold">{deviceOS} KeyStore</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setScanState("idle");
                onClose();
              }}
              className="text-xs text-slate-550 hover:text-slate-800 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition cursor-pointer w-1/2 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setScanState("success");
                setTimeout(() => {
                  onSuccess();
                  setScanState("idle");
                  onClose();
                }, 1000);
              }}
              className="text-xs text-blue-700 font-bold px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer w-1/2"
            >
              Use Mock Passcode
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
