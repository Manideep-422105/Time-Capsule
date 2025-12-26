"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Wand2 } from "lucide-react";
import { processMessage } from "@/app/actions/ai"; 

interface AiSummarizerProps {
  message: string;
  onRefine?: (refinedText: string) => void; // Optional: to update the main textarea
}

export default function AiSummarizer({ message, onRefine }: AiSummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [refined, setRefined] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleProcess = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await processMessage(message);
    
    // Check if result exists and doesn't have an error property
    if (result && !('error' in result)) {
      // Use logical OR (||) to ensure we pass null if the value is undefined
      setSummary(result.summary || null);
      setRefined(result.refined || null);
    } else {
      // Cast result as any or check the specific error field
      setError((result as any)?.error || "The Time Assistant is busy.");
    }
    setIsLoading(false);
  };

  const handleClear = () => {
    setSummary(null);
    setRefined(null);
    setError(null);
  };

  // If we have an error or a summary, show the "Result" card
  if (summary || error) {
    return (
      <div className="mb-4 p-4 rounded-xl bg-linear-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-[10px] uppercase tracking-widest text-purple-300 font-bold">AI Time Assistant</span>
          </div>
          <button onClick={handleClear} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error ? (
          <p className="text-xs text-red-300 italic">{error}</p>
        ) : (
          <div className="space-y-3">
            {/* Summary Section */}
            <p className="text-xs text-purple-100 italic leading-relaxed">
              &ldquo;{summary}&rdquo;
            </p>

            {/* Refinement Suggestion Section */}
            {onRefine && refined && (
              <div className="pt-2 border-t border-purple-500/20">
                <button 
                  onClick={() => onRefine(refined)}
                  className="flex items-center gap-1.5 text-[10px] bg-purple-500/30 hover:bg-purple-500/50 text-white px-2 py-1 rounded transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  Apply AI Refinements
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Initial State: Show the "Process" button
  return (
    <div className="flex justify-end mb-2">
      <button
        onClick={handleProcess}
        disabled={isLoading || message.length < 30}
        className="text-xs flex items-center gap-2 bg-purple-600/20 text-purple-200 px-4 py-1.5 rounded-full border border-purple-500/40 hover:bg-purple-600/40 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
        )}
        {isLoading ? "Consulting the Stars..." : "Refine & Summarize"}
      </button>
    </div>
  );
}