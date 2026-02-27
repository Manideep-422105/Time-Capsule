"use client";

import { useState } from "react";
import {
  Inbox,
  Send,
  User,
  Search,
  Plus,
  LayoutGrid,
  Lock,
  Unlock,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import CapsuleCard from "./CapsuleCard";
import Countdown from "./Countdown";
import UpgradeModal from "./UpgradeModal";

type DashboardProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  sent: any[];
  received: any[];
  isPremium: boolean;
};

export default function DashboardClient({
  user,
  sent,
  received,
  isPremium,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"INBOX" | "SENT">("INBOX");
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const currentList = activeTab === "INBOX" ? received : sent;
  const filteredList = currentList.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.message && c.message.toLowerCase().includes(search.toLowerCase())),
  );

  const totalCapsules = sent.length + received.length;
  const unlockedCount = [...sent, ...received].filter(
    (c) => new Date() >= new Date(c.unlockDate),
  ).length;
  const lockedCount = totalCapsules - unlockedCount;

  const allLocked = [...sent, ...received]
    .filter((c) => new Date() < new Date(c.unlockDate))
    .sort(
      (a, b) =>
        new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime(),
    );
  const nextUnlock = allLocked[0];

  return (
    <div className="flex min-h-screen bg-[#050510] text-gray-100 overflow-hidden font-sans">
      {/* --- SIDEBAR --- */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-white/10 bg-black/90 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-8 flex justify-between items-center">
          <div>
            {/* 2. SHOW PRO BADGE */}
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600 tracking-tighter">
                TimeVault
              </span>
              {isPremium && (
                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/50 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  PRO
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Chrono-Storage Protocol
            </p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Sidebar"
            className="md:hidden text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("INBOX");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "INBOX"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Inbox className="w-5 h-5" /> Received Memories
            {received.length > 0 && (
              <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">
                {received.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("SENT");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "SENT"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Send className="w-5 h-5" /> Sent Capsules
            {sent.length > 0 && (
              <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-xs">
                {sent.length}
              </span>
            )}
          </button>
        </nav>

        {/* 3. CONDITIONALLY HIDE UPGRADE BUTTON FOR PREMIUM USERS */}
        {!isPremium && (
          <div className="p-4">
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full relative group overflow-hidden rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all text-left"
            >
              <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">
                <Zap className="w-12 h-12 text-yellow-500 rotate-12" />
              </div>
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-1">
                Pro Plan
              </p>
              <p className="text-sm text-gray-300 font-medium">Upgrade to 4K</p>
            </button>
          </div>
        )}

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-all group"
          >
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full border-2 border-blue-500/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                {user.name?.[0] || "U"}
              </div>
            )}

            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">View Profile</p>
            </div>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 glass-panel border-b border-white/5 p-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search memories by title or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>

          <Link
            href="/create"
            className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Plus className="w-5 h-5" /> New Capsule
          </Link>
        </header>

        <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<LayoutGrid />}
              label="Total Memories"
              value={totalCapsules}
              color="text-blue-400"
            />
            <StatCard
              icon={<Lock />}
              label="Locked"
              value={lockedCount}
              color="text-gray-400"
            />
            <StatCard
              icon={<Unlock />}
              label="Unlocked"
              value={unlockedCount}
              color="text-green-400"
            />

            <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-3 mb-2 text-gray-400 text-sm font-medium">
                Next Event
              </div>
              {nextUnlock ? (
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white truncate">
                    {nextUnlock.title}
                  </span>
                  <span className="text-xs text-purple-300 mt-1">
                    {new Date(nextUnlock.unlockDate).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500 text-sm">No pending events</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {activeTab === "INBOX" ? (
                  <Inbox className="text-blue-400" />
                ) : (
                  <Send className="text-purple-400" />
                )}
                {activeTab === "INBOX" ? "Inbox" : "Outbox"}
              </h2>
              <span className="text-xs text-gray-500 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {filteredList.length} Capsules
              </span>
            </div>

            {filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl text-gray-500">
                {search ? (
                  <p>No results found for "{search}"</p>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      {activeTab === "INBOX" ? (
                        <Inbox className="opacity-50" />
                      ) : (
                        <Send className="opacity-50" />
                      )}
                    </div>
                    <p>No capsules in this section yet.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {filteredList.map((capsule) => (
                  <CapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    isReceived={activeTab === "INBOX"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Link
          href="/create"
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl z-50 text-white"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </main>

      {/* --- PROFILE MODAL --- */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProfile(false)}
          ></div>
          <div className="relative w-full max-w-md bg-[#0a0a15] h-full border-l border-white/10 shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                aria-label="Close Profile"
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-10">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-24 h-24 rounded-full mb-4 border-4 border-blue-500/30 object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                  {user.name?.[0] || "U"}
                </div>
              )}

              <h3 className="text-2xl font-bold text-white">{user.name}</h3>
              <p className="text-gray-400">{user.email}</p>
            </div>

            <div className="space-y-6 flex-1">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4">
                  Account Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sent</span>
                    <span className="font-mono text-purple-400">
                      {sent.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Received</span>
                    <span className="font-mono text-blue-400">
                      {received.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-white/5 ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-white font-mono">{value}</p>
      </div>
    </div>
  );
}
