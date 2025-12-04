"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { generateSummary } from "@/app/actions/ai"; 

interface AiSummarizerProps {
  message: string;
}

export default function AiSummarizer({ message }: AiSummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    const result = await generateSummary(message);
    
    if (result) {
      setSummary(result);
    } else {
      setSummary("Sorry, the Time Assistant couldn't generate a summary right now.");
    }
    setIsLoading(false);
  };

  if (summary) {
    return (
      <div className="mb-3 p-3 rounded-lg bg-linear-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 flex gap-2 items-start transition-all duration-300">
        <Sparkles className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
        <p className="text-xs text-purple-200 italic leading-relaxed flex-1">
          {summary}
        </p>
        <button onClick={() => setSummary(null)} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex justify-end mb-2">
        <button
          onClick={handleSummarize}
          disabled={isLoading || message.length < 50}
          className="text-xs flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 hover:bg-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title={message.length < 50 ? "Message must be longer to summarize" : "Generate AI Summary"}
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {isLoading ? "Summarizing..." : "Summarize Message"}
        </button>
    </div>
  );
}