"use client";
import Image from "next/image";
import Navbar from "../components/header/Navbar";
import { HeroSection } from "../components/HeroSection";
import LatestTxns from "../components/LatestTxns";
import { getAllVaultAccount } from "../lib/anchor/services";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getConnection } from "../lib/solana/connection";
import { useEffect, useState } from "react";
import { Meteors } from "../components/ui/Meteors";

export default function Home() {
  const wallet = useAnchorWallet();

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="relative h-full">
        <Meteors number={15} />
        <div className="py-7 px-6 md:px-12">
          <Navbar />
          <HeroSection isWalletConnected={!wallet} />
        </div>

        <div className="bg-zinc-50 dark:bg-black h-full w-full">
          <LatestTxns />
        </div>
      </main>

      {/* <Example /> */}
    </div>
  );
}
