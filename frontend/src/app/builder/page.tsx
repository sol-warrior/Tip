"use client";
import { Button } from "@/src/components/ui/button";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  balOfVaultAccount,
  getCreatorAccount,
  getCreatorVaultAccount,
  getWithdrawAllTip,
  initializeVault,
} from "@/src/lib/anchor/services";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getConnection } from "@/src/lib/solana/connection";
import { AnchorError } from "@coral-xyz/anchor";

const dmsans = DM_Sans({
  subsets: ["latin"],
});
const page = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vaultBal, setBal] = useState<number>(0);
  const [vaultAcc, setVaultAcc] = useState<
    { creatorVault: string; totaltips: number; creatorAdd: string } | undefined
  >({
    creatorVault: "",
    totaltips: 0,
    creatorAdd: "",
  });
  const wallet = useAnchorWallet();
  const connection = getConnection();

  const handleActivateWallet = async () => {
    try {
      if (!wallet?.publicKey) {
        console.log("Please connect your wallet.");
        return;
      }
      setIsLoading(true);
      const result = await getCreatorVaultAccount(wallet, connection);

      if (!result?.exists) {
        await initializeVault(wallet, connection);
      }

      const final = await getCreatorVaultAccount(wallet, connection);

      setVaultAcc({
        creatorAdd: final?.account?.creator.toString() || "",
        creatorVault: final?.vaultPda.toString() || "",
        totaltips: Number(final?.account.totalTips) / 1e9 || 0,
      });
      setIsActivated(true);
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error(
          "Vault setup failed:",
          (error as { message?: string }).message
        );
      } else {
        console.error("Vault setup failed:", error);
      }
      // optionally show toast
      setIsActivated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawTip = async () => {
    try {
      if (!wallet?.publicKey) return;

      const bal = await getWithdrawAllTip(wallet, connection);
      accBalance();
    } catch (err) {
      if (err instanceof AnchorError) {
        console.log("Error Name:", err.name); // e.g., "InsufficientBalance"
        console.log("Error Code:", err.error.errorCode); // e.g., 6001
        console.log("Error Msg:", err.error.errorMessage); // e.g., "Insufficient balance"
      } else {
        console.error("Non-Anchor Error:", err);
      }
    }
    // setBal(bal);
  };

  const accBalance = async () => {
    if (!wallet?.publicKey) return;

    const bal = await balOfVaultAccount(connection, wallet.publicKey);
    setBal(bal);
  };
  useEffect(() => {
    if (!wallet) return;
    handleActivateWallet();
    accBalance();
  }, [wallet]);
  return (
    <>
      <div
        className={`text-black  flex items-center justify-between ${dmsans.className} mt-20 `}
      >
        <div>
          <p
            className="text-2xl md:text-[2.7rem]  font-semibold "
            style={{ fontFamily: "cursive" }}
          >
            Hey builders (2Y…i0),
            <br />
            Appreciate the impact you’re creating.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <p>Total tips : {vaultAcc?.totaltips} SOL </p>
          <p>Balance left : {vaultBal} SOL</p>
        </div>
      </div>

      <div className="flex items-center justify-center flex-col h-[45vh] gap-10">
        {!isActivated ? (
          <Button
            variant={"secondary"}
            className="bg-[#522AA5] hover:bg-[#5128a5d9] text-white font-semibold cursor-pointer"
            onClick={handleActivateWallet}
          >
            Activate Your Wallet
          </Button>
        ) : (
          <>
            <div className="flex gap-2 flex-col items-center">
              <p className="border-2 text-2xl text-gray-900 px-2 py-1 rounded-2xl">
                {vaultAcc?.creatorVault}
              </p>
              <p className="text-black text-xs">
                Share with the world →{" "}
                <Link href={`/tip/${vaultAcc?.creatorVault}`}>
                  <span className="text-indigo-700">
                    {" "}
                    https://tipper.vercel.app/tip/{vaultAcc?.creatorVault}
                  </span>{" "}
                </Link>
              </p>
            </div>
            {vaultBal > 0 && (
              <div>
                <Button
                  onClick={handleWithdrawTip}
                  variant={"secondary"}
                  className="bg-[#522AA5] mt-3 hover:bg-[#5128a5d9] text-white font-semibold cursor-pointer"
                >
                  Withdraw
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default page;
