"use client";

import { useState } from "react";
import { searchSpotify } from "@/app/actions/spotify";
import { Music, Search, X, Loader2 } from "lucide-react";

interface SpotifySearchProps {
  onSelect: (trackId: string | null) => void;
}

export default function SpotifySearch({ onSelect }: SpotifySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length > 2) {
      setLoading(true);
      // Debounce logic could go here, but for MVP we call directly
      const tracks = await searchSpotify(val);
      setResults(tracks);
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const selectTrack = (track: any) => {
    setSelectedTrack(track);
    onSelect(track.id); // Send ID to parent form
    setQuery("");
    setResults([]);
  };

  const removeTrack = () => {
    setSelectedTrack(null);
    onSelect(null);
  };

  return (
    <div className="space-y-2 relative">
      <label className="flex items-center gap-2 text-sm font-bold text-pink-400">
        <Music className="w-4 h-4" /> Soundtrack (Optional)
      </label>

      {selectedTrack ? (
        // SELECTED STATE
        <div className="flex items-center gap-3 p-3 glass-panel rounded-xl border border-pink-500/50 bg-pink-500/10">
          <img
            src={selectedTrack.image}
            alt="Art"
            className="w-10 h-10 rounded shadow-md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white">
              {selectedTrack.name}
            </p>
            <p className="text-xs text-gray-300 truncate">
              {selectedTrack.artist}
            </p>
          </div>
          <button
            type="button"
            onClick={removeTrack}
            aria-label="Remove"
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      ) : (
        // SEARCH STATE
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search for a song..."
              value={query}
              onChange={handleSearch}
              className="w-full p-3 pl-10 rounded-xl glass-input focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-pink-400" />
            )}
          </div>

          {/* RESULTS DROPDOWN */}
          {results.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-[#0a0a15] border border-gray-700 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
              {results.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => selectTrack(track)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-pink-600/20 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <img
                    src={track.image}
                    alt="Art"
                    className="w-8 h-8 rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate">
                      {track.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {track.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
