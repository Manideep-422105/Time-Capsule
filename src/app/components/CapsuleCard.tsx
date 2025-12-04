"use client";

import { useState } from "react";
import { Lock, Unlock, Clock, User } from "lucide-react";
import Countdown from "./Countdown";
import OpenButton from "./OpenButton";
import DeleteButton from "./DeleteButton";
import AiSummarizer from "./AiSummarizer"; // Import the new component

export default function CapsuleCard({ capsule, isReceived }: { capsule: any, isReceived: boolean }) {
    const initialUnlockState = new Date() >= new Date(capsule.unlockDate);
    const [isUnlocked, setIsUnlocked] = useState(initialUnlockState);
    const senderId = capsule.pk.split("#")[1];

    return (
        <div className={`glass-panel p-6 rounded-xl flex flex-col gap-4 h-auto min-h-[14rem] transition-all hover:-translate-y-1 duration-300 ${isUnlocked ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-700'}`}>
            <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg truncate pr-2 text-white">{capsule.title}</h3>
                    {isUnlocked ? <User className="w-5 h-5 text-green-400 shrink-0" /> : <Lock className="w-5 h-5 text-gray-500 shrink-0" />}
                </div>
                
                <p className="text-xs text-gray-400">
                    {isReceived ? `From: ${capsule.senderName || "Unknown"}` : `To: ${capsule.recipientEmail}`}
                </p>
                
                {/* --- AI SUMMARY BUTTON (Receiver Only) --- */}
                {isUnlocked && capsule.message && isReceived && (
                    <AiSummarizer message={capsule.message} />
                )}

                {/* Raw Message */}
                {isUnlocked && capsule.message && (
                    <p className="text-sm text-gray-300 line-clamp-4 italic border-l-2 border-gray-700 pl-3">
                        "{capsule.message}"
                    </p>
                )}

                {/* Spotify Embed */}
                {isUnlocked && capsule.spotifyTrackId && (
                    <div className="rounded-lg overflow-hidden shadow-lg border border-white/10 mt-2">
                        <iframe 
                            style={{ borderRadius: "12px" }} 
                            src={`https://open.spotify.com/embed/track/${capsule.spotifyTrackId}?utm_source=generator&theme=0`} 
                            width="100%" 
                            height="80" 
                            frameBorder="0" 
                            allowFullScreen 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                        ></iframe>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(capsule.unlockDate).toLocaleDateString()}
                </span>

                {isUnlocked ? (
                    <OpenButton capsuleId={capsule.id} senderId={senderId} />
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                            <span className="px-3 py-1 bg-gray-800 text-gray-500 text-xs rounded-full border border-gray-700 mb-1">
                                Locked
                            </span>
                            <Countdown targetDate={capsule.unlockDate} onFinish={() => setIsUnlocked(true)} />
                        </div>
                        {!isReceived && <DeleteButton capsuleId={capsule.id} />}
                    </div>
                )}
                
                {!isReceived && isUnlocked && <DeleteButton capsuleId={capsule.id} />}
            </div>
        </div>
    );
}