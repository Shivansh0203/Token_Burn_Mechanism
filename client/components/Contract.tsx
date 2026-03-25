"use client";

import { useState, useCallback } from "react";
import {
  burn,
  mint,
  getBalance,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#f97316]/30 focus-within:shadow-[0_0_20px_rgba(249,115,22,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "balance" | "mint" | "burn";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("balance");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Mint state
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  // Burn state
  const [burnAmount, setBurnAmount] = useState("");
  const [isBurning, setIsBurning] = useState(false);

  // Balance state
  const [balanceAddress, setBalanceAddress] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<bigint | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleMint = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!mintTo.trim()) return setError("Enter recipient address");
    if (!mintAmount.trim() || Number(mintAmount) <= 0) return setError("Enter valid amount");
    setError(null);
    setIsMinting(true);
    setTxStatus("Minting tokens...");
    try {
      await mint(walletAddress, mintTo.trim(), BigInt(mintAmount));
      setTxStatus("Tokens minted successfully!");
      setMintTo("");
      setMintAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsMinting(false);
    }
  }, [walletAddress, mintTo, mintAmount]);

  const handleBurn = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!burnAmount.trim() || Number(burnAmount) <= 0) return setError("Enter valid amount");
    setError(null);
    setIsBurning(true);
    setTxStatus("Burning tokens...");
    try {
      await burn(walletAddress, BigInt(burnAmount));
      setTxStatus("Tokens burned successfully!");
      setBurnAmount("");
      // Refresh balance after burn
      if (walletAddress) {
        const bal = await getBalance(walletAddress);
        setCurrentBalance(bal as bigint);
      }
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsBurning(false);
    }
  }, [walletAddress, burnAmount]);

  const handleCheckBalance = useCallback(async () => {
    const addressToCheck = balanceAddress.trim() || walletAddress;
    if (!addressToCheck) return setError("Connect wallet or enter address");
    setError(null);
    setIsLoadingBalance(true);
    setCurrentBalance(null);
    try {
      const result = await getBalance(addressToCheck);
      setCurrentBalance(result as bigint);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [balanceAddress, walletAddress]);

  // Load balance on wallet connect
  const handleConnectAndLoadBalance = useCallback(async () => {
    onConnect();
    // After connect, balance will auto-load
  }, [onConnect]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "balance", label: "Balance", icon: <WalletIcon />, color: "#4fc3f7" },
    { key: "mint", label: "Mint", icon: <CoinsIcon />, color: "#22c55e" },
    { key: "burn", label: "Burn", icon: <FlameIcon />, color: "#f97316" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("success") || txStatus.includes("successfully") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f97316]/20 to-[#ef4444]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97316]">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Token Burn Mechanism</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Balance */}
            {activeTab === "balance" && (
              <div className="space-y-5">
                <MethodSignature name="balance" params="(user: Address)" returns="-> i128" color="#4fc3f7" />
                <Input 
                  label="Address (leave empty for connected wallet)" 
                  value={balanceAddress} 
                  onChange={(e) => setBalanceAddress(e.target.value)} 
                  placeholder={walletAddress || "G..."} 
                />
                <ShimmerButton onClick={handleCheckBalance} disabled={isLoadingBalance} shimmerColor="#4fc3f7" className="w-full">
                  {isLoadingBalance ? <><SpinnerIcon /> Loading...</> : <><WalletIcon /> Check Balance</>}
                </ShimmerButton>

                {currentBalance !== null && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Token Balance</span>
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                        Available
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Balance</span>
                        <span className="font-mono text-xl text-white/80">{currentBalance.toString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mint */}
            {activeTab === "mint" && (
              <div className="space-y-5">
                <MethodSignature name="mint" params="(to: Address, amount: i128)" color="#22c55e" />
                <Input 
                  label="Recipient Address" 
                  value={mintTo} 
                  onChange={(e) => setMintTo(e.target.value)} 
                  placeholder="G... (recipient)" 
                />
                <Input 
                  label="Amount" 
                  type="number"
                  value={mintAmount} 
                  onChange={(e) => setMintAmount(e.target.value)} 
                  placeholder="1000" 
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleMint} disabled={isMinting} shimmerColor="#22c55e" className="w-full">
                    {isMinting ? <><SpinnerIcon /> Minting...</> : <><CoinsIcon /> Mint Tokens</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#22c55e]/20 bg-[#22c55e]/[0.03] py-4 text-sm text-[#22c55e]/60 hover:border-[#22c55e]/30 hover:text-[#22c55e]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to mint tokens
                  </button>
                )}
              </div>
            )}

            {/* Burn */}
            {activeTab === "burn" && (
              <div className="space-y-5">
                <MethodSignature name="burn" params="(from: Address, amount: i128)" color="#f97316" />
                <Input 
                  label="Amount to Burn" 
                  type="number"
                  value={burnAmount} 
                  onChange={(e) => setBurnAmount(e.target.value)} 
                  placeholder="10" 
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleBurn} disabled={isBurning} shimmerColor="#f97316" className="w-full">
                    {isBurning ? <><SpinnerIcon /> Burning...</> : <><FlameIcon /> Burn Tokens</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f97316]/20 bg-[#f97316]/[0.03] py-4 text-sm text-[#f97316]/60 hover:border-[#f97316]/30 hover:text-[#f97316]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to burn tokens
                  </button>
                )}
                <p className="text-[10px] text-white/25 text-center">
                  Burning tokens permanently removes them from circulation
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Token Burn Mechanism &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#4fc3f7]" />
                <span className="font-mono text-[9px] text-white/15">Balance</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#22c55e]" />
                <span className="font-mono text-[9px] text-white/15">Mint</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#f97316]" />
                <span className="font-mono text-[9px] text-white/15">Burn</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
