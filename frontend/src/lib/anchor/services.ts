"use client";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { BN, Program, Wallet } from "@coral-xyz/anchor";
import { AnchorProject } from "./anchor_project_idl";
import idl from "./anchor_project_idl.json";
import { getProgram } from "./program";
// This error occurs if `@solana/wallet-adapter-react` (or its types) is not installed or is missing from your `node_modules`.
// To fix it, run:
//   npm install @solana/wallet-adapter-react
//   npm install --save-dev @types/solana__wallet-adapter-react
import {
  AnchorWallet,
  useAnchorWallet,
  useWallet,
} from "@solana/wallet-adapter-react";

// const connection = new Connection("https://api.devnet.solana.com", "confirmed");

//   const program = new Program(idl as AnchorProject, {
//     connection,
//   });

export async function initializeVault(wallet: AnchorWallet, conn: Connection) {
  console.log("Initialize start : 1");

  console.log("Initialize start : 1");
  console.log("Wallet.pub", wallet.publicKey.toBase58());
  if (!conn || !wallet.publicKey) {
    console.error("Please connect your wallet");
    throw new Error("Please connect your wallet");
  }
  const program = getProgram(conn, wallet);
  if (!program) {
    console.error("Error initializing program");
    throw new Error("Error initializing program");
  }

  console.log({ program });
  const init_creator_vault = await program.methods
    .initVault()
    .accounts({
      creator: wallet.publicKey,
    })
    .rpc();

  console.log("Signature of init_creator_vault", init_creator_vault);
}

export async function getCreatorAccount(
  wallet: AnchorWallet,
  conn: Connection
) {
  if (!conn || !wallet.publicKey) {
    console.error("Please connect your wallet");
    throw new Error("Please connect your wallet");
  }
  const program = getProgram(conn, wallet);
  if (!program) {
    console.error("Error initializing program");
    throw new Error("Error initializing program");
  }

  const [creatorPda, _bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    new PublicKey(idl.address)
  );
  console.log("CreatorPda ,", creatorPda.toBase58());
  const vaultAccount = await program.account.vault.fetch(creatorPda);

  console.log("Vault Account", vaultAccount.creator.toBase58());

  return vaultAccount;
}

export async function getAllVaultAccount(
  wallet: AnchorWallet,
  conn: Connection
) {
  if (!conn || !wallet.publicKey) {
    console.error("Please connect your wallet");
    throw new Error("Please connect your wallet");
  }
  const program = getProgram(conn, wallet);
  if (!program) {
    console.error("Error initializing program");
    throw new Error("Error initializing program");
  }

  // const [creatorPda, _bump] = await PublicKey.findProgramAddressSync(
  //   [Buffer.from("vault"), wallet.publicKey.toBuffer()],
  //   new PublicKey(idl.address)
  // );
  // console.log("CreatorPda ,", creatorPda.toBase58());
  const vaultAccount = await program.account.vault.all();

  console.log("Vault Account", vaultAccount);

  return vaultAccount;
}

export async function getCreatorVaultAccount(
  wallet: AnchorWallet,
  connection: Connection
) {
  const program = getProgram(connection, wallet);
  if (!program) return;

  const [vaultPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    new PublicKey(idl.address)
  );
  console.log("Vault Pda:", vaultPda.toString());

  const info = await connection.getAccountInfo(vaultPda);
  console.log("Info", info);

  if (!info) {
    return { exists: false, vaultPda, account: null };
  }

  const account = await program.coder.accounts.decode("vault", info.data);
  console.log("Decode account", account); //Decode account {creator: PublicKey, bump: 253, totalTips: BN}

  return { exists: true, vaultPda, account };
}

export async function getDepositTip(
  wallet: AnchorWallet,
  conn: Connection,
  amount: number,
  tipid: string
) {
  if (!conn || !wallet.publicKey) {
    console.error("Please connect your wallet");
    throw new Error("Please connect your wallet");
  }
  const program = getProgram(conn, wallet);
  if (!program) return;

  const creatorVault = new PublicKey(tipid);
  console.log("Depositing start ");
  console.log("Wallet.pub", wallet.publicKey.toBase58());

  console.log({ program });
  console.log(amount);

  const lamports = Math.round(amount * LAMPORTS_PER_SOL);
  const bnAmount = new BN(lamports.toString());
  const sign = await program.methods
    .depositTip(bnAmount)
    .accounts({
      sender: wallet.publicKey,
      vault: creatorVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Signature of init_creator_vault", sign);
  return sign;
}

export async function getWithdrawAllTip(
  wallet: AnchorWallet,
  conn: Connection
) {
  if (!conn || !wallet.publicKey) {
    console.error("Please connect your wallet");
    throw new Error("Please connect your wallet");
  }
  const program = getProgram(conn, wallet);
  if (!program) return;

  const [creatorVault, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    new PublicKey(idl.address)
  );
  console.log("Vault Pda:", creatorVault.toString());

  console.log("Depositing start ");
  console.log("Wallet.pub", wallet.publicKey.toBase58());

  const sign = await program.methods
    .withdrawTip()
    .accounts({
      creator: wallet.publicKey,
      vault: creatorVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Deposit Tip Vault", sign);
  return sign;
}

export const balOfVaultAccount = async (
  conn: Connection,
  address: PublicKey
) => {
  try {
    const [vaultPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), new PublicKey(address).toBuffer()],
      new PublicKey(idl.address)
    );
    let lamp = await conn.getBalance(vaultPda);
    return lamp / 1000000000;
  } catch (error) {
    return 0;
  }
};
