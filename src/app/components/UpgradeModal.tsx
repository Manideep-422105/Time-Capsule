"use client";

import { useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        toast.error("Failed to start checkout");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a15] border border-purple-500/30 w-full max-w-md rounded-2xl p-8 relative shadow-2xl shadow-purple-900/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-gray-400">Unlock the full power of time travel.</p>
        </div>

        <div className="space-y-4 mb-8">
          <Feature text="10GB Storage Limit (vs 10MB)" />
          <Feature text="4K Video Support" />
          <Feature text="Unlimited AI Summaries" />
          <Feature text="Priority Delivery" />
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          {/* UPDATED TEXT FOR INDIA */}
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Subscribe for ₹499/mo"
          )}
        </button>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-300">
      <div className="p-1 bg-green-500/20 rounded-full">
        <Check className="w-4 h-4 text-green-400" />
      </div>
      {text}
    </div>
  );
}
