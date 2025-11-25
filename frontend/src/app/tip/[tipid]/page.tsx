"use client";
import LatestTxns from "@/src/components/LatestTxns";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Navbar from "@/src/components/header/Navbar";
import { getDepositTip } from "@/src/lib/anchor/services";
import { getConnection } from "@/src/lib/solana/connection";
import { formatAddress } from "@/src/lib/utils";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Coins,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { balOfVaultAccount } from "@/src/lib/anchor/services";
import Link from "next/link";

const TipPage = () => {
  const wallet = useAnchorWallet();
  const connection = getConnection();
  const { tipid } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isSign, setIsSign] = useState("");
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [isValidVault, setIsValidVault] = useState<boolean>(true);

  const builderAddForTip = tipid as string;

  useEffect(() => {
    const fetchVaultBalance = async () => {
      try {
        const vaultPda = new PublicKey(builderAddForTip);
        const balance = await balOfVaultAccount(connection, vaultPda);
        setVaultBalance(balance);
        setIsValidVault(true);
      } catch (error) {
        console.error("Failed to fetch vault balance:", error);
        setIsValidVault(false);
      }
    };

    if (builderAddForTip) {
      fetchVaultBalance();
    }
  }, [builderAddForTip, connection]);

  const handleTipWallet = async () => {
    const tipAmount = parseFloat(amount);

    if (!tipAmount || tipAmount <= 0) {
      return;
    }

    try {
      setIsLoading(true);

      if (!wallet?.publicKey) {
        throw new Error("Please connect your wallet");
      }

      const sign = await getDepositTip(
        wallet,
        connection,
        tipAmount,
        builderAddForTip
      );

      setIsSign(sign || "");
      setAmount("");

      // Refresh vault balance after tip
      const balance = await balOfVaultAccount(
        connection,
        new PublicKey(builderAddForTip)
      );
      setVaultBalance(balance);
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error(
          "Deposit tip failed:",
          (error as { message?: string }).message
        );
      } else {
        console.error("Vault deposit tip failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidVault) {
    return (
      <div className="bg-zinc-50 font-sans dark:bg-black min-h-screen">
        <main className="h-full">
          <div className="py-7 px-6 md:px-12">
            <section className="max-w-5xl mx-auto mt-20 text-center">
              <Card className="glass-card border-red-200 dark:border-red-800 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                    Invalid Vault Address
                  </CardTitle>
                  <CardDescription>
                    The vault address you're looking for doesn't exist or is
                    invalid.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/tipper">
                    <Button className="w-full sm:w-auto">
                      Search for a Creator
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="h-full">
        <div className="py-7 px-6 md:px-12">
          <section className="max-w-5xl mx-auto mt-12 md:mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/40 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Send a Tip
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-[1.1] tracking-tight mb-4">
                Hey{" "}
                <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Tipper
                </span>
                {wallet?.publicKey && (
                  <span className="text-2xl md:text-3xl block mt-2 text-muted-foreground font-normal">
                    {formatAddress(wallet.publicKey.toString())}
                  </span>
                )}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto">
                Your support makes it easier to bring good things to the world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Vault Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs font-mono text-foreground break-all">
                    {formatAddress(builderAddForTip)}
                  </code>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Vault Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-secondary">
                    {vaultBalance.toFixed(4)} SOL
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-primary/20 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Send a Tip
                </CardTitle>
                <CardDescription className="text-center">
                  Enter the amount you'd like to tip (in SOL)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Amount (SOL)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.001"
                    className="text-lg h-14 text-center"
                    min={0}
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading || !wallet}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Minimum: 0.001 SOL
                  </p>
                </div>

                {!wallet && (
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
                      Please connect your wallet to send a tip
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleTipWallet}
                  disabled={
                    isLoading || !wallet || !amount || parseFloat(amount) <= 0
                  }
                  size="lg"
                  className="w-full group cursor-pointer bg-secondary hover:bg-secondary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-green transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-secondary/50"
                >
                  <Coins className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  {isLoading ? "Processing..." : `Tip ${amount || "0"} SOL`}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {isSign && (
                  <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h3 className="font-semibold text-green-800 dark:text-green-300">
                            Tip Sent Successfully!
                          </h3>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Transaction Signature:
                        </p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-black/40 border border-green-200 dark:border-green-800">
                          <code className="flex-1 text-xs font-mono text-foreground break-all">
                            {isSign}
                          </code>
                          <Link
                            href={`https://explorer.solana.com/tx/${isSign}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="bg-zinc-50 dark:bg-black h-full w-full mt-20">
          <LatestTxns />
        </div>
      </main>
    </div>
  );
};

export default TipPage;
