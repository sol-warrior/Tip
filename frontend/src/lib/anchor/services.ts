import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { BN, Program, Wallet } from "@coral-xyz/anchor";
import { AnchorProject } from "./anchor_project_idl";
import idl from "./anchor_project_idl.json";
import { getProgram } from "./program";

import { AnchorWallet } from "@solana/wallet-adapter-react";

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
    let lamp = await conn.getBalance(address);
    // console.log({ lamp });
    return lamp / 1000000000;
  } catch (error) {
    return 0;
  }
};

export const balOfCreatorVaultAccount = async (
  conn: Connection,
  address: PublicKey
) => {
  try {
    const [vaultPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), new PublicKey(address).toBuffer()],
      new PublicKey(idl.address)
    );
    let lamp = await conn.getBalance(vaultPda);
    console.log("Builder Vault Lamp:", lamp);
    return lamp / 1000000000;
  } catch (error) {
    return 0;
  }
};

function safePubkeyCheck(input: string) {
  let actualPda: PublicKey;

  try {
    actualPda = new PublicKey(input);
  } catch (err) {
    console.log("Invalid public key format.");
    return;
  }

  return actualPda;
}

export const checkCreatorVaultAccount = async (
  pdaInput: string,
  conn: Connection
) => {
  let accDetails: {
    isExist: boolean;
    pdaAcc: null | string;
    message: string;
  } = { isExist: false, message: "Not Found", pdaAcc: null };
  try {
    const actualPda = safePubkeyCheck(pdaInput);
    if (!actualPda) {
      accDetails.message = "Not Exist";

      return accDetails;
    }

    const accountInfo = await conn.getAccountInfo(actualPda);

    if (!accountInfo) {
      console.log("This account does NOT exist on-chain.");
      throw new Error("This account does NOT exist on-chain.");
    }

    if (accountInfo.owner.equals(new PublicKey(idl.address))) {
      console.log("✅ This PDA is owned by the program.");
      accDetails.isExist = true;
      accDetails.message = "This account is owned by the program.";
      accDetails.pdaAcc = actualPda.toString();
    } else if (
      accountInfo.owner.equals(
        new PublicKey("11111111111111111111111111111111")
      )
    ) {
      const [creatorVault, _] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new PublicKey(pdaInput).toBuffer()],
        new PublicKey(idl.address)
      );
      console.log("Creator vault Pda:", creatorVault.toString());

      const accountInfo = await conn.getAccountInfo(creatorVault);

      if (!accountInfo) {
        console.log("This account does NOT exist on-chain.");
        throw new Error("This account does NOT exist on-chain.");
      } else {
        console.log("✅ This PDA is owned by the program.");
        accDetails.isExist = true;
        accDetails.message = "This account is owned by the program.";
        accDetails.pdaAcc = creatorVault.toString();
      }
    }

    return accDetails;
  } catch (error) {
    console.log(error);

    return accDetails;
  }
};

export interface TransferInfo {
  from: string;
  to: string;
  amount: number; // in SOL
}

export interface TxScanResult {
  signature: string;
  slot: number;
  transfers: TransferInfo[];
}

/**
 * Attempt to decode a SystemProgram transfer instruction into a TransferInfo.
 * Returns null if not a valid transfer instruction.
 */
function decodeOnlyTransfer(inst: TransactionInstruction): TransferInfo | null {
  try {
    // SystemProgram.transfer instruction layout: first u32 == 2, next 8 bytes is lamports
    if (
      inst.programId.equals(SystemProgram.programId) &&
      inst.data.length === 12 &&
      inst.data[0] === 2 &&
      inst.keys.length >= 2
    ) {
      const from = inst.keys[0].pubkey.toString();
      const to = inst.keys[1].pubkey.toString();
      // lamports: bytes 4-11 (little-endian)
      const lamports = Number(inst.data.readBigUInt64LE(4));
      return {
        from,
        to,
        amount: lamports / 1e9,
      };
    }
  } catch (e) {
    // fail silently, return null
  }
  return null;
}

/**
 * Scans latest transactions involving the given programId and extracts transfer instructions.
 * Returns up to 'limit' TxScanResult objects, each containing all system transfers in that txn.
 */
export async function scanProgramTransfers(
  connection: Connection,
  programId: PublicKey,
  limit: number = 5
): Promise<TxScanResult[]> {
  const signatures = await connection.getSignaturesForAddress(programId, {
    limit,
  });
  const results: TxScanResult[] = [];

  for (const sig of signatures) {
    const tx = await connection.getTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) continue;

    const transfers: TransferInfo[] = [];

    // Support versioned and legacy transactions
    const message = tx.transaction.message;
    let compiledInstructions = [];
    let accountKeys: PublicKey[] = [];

    // Modern solana/web3.js v1.73+ uses getAccountKeys() and .compiledInstructions
    try {
      // @ts-ignore Supports both Message and VersionedMessage, fallback otherwise.
      if ("getAccountKeys" in message && "compiledInstructions" in message) {
        accountKeys = Array.from(message.getAccountKeys().staticAccountKeys);
        compiledInstructions = message.compiledInstructions || [];
      } else if ("accountKeys" in message && "instructions" in message) {
        // Fallback for older message types
        accountKeys = message.accountKeys.slice();
        compiledInstructions = message.instructions;
      }
    } catch (e) {
      continue;
    }

    for (const inst of compiledInstructions) {
      // CompiledInstruction: { programIdIndex, accounts, data }
      let programId: PublicKey;
      let keys: { pubkey: PublicKey }[] = [];
      let data: Buffer;

      // Handle both message v0 and legacy layouts
      try {
        if ("programIdIndex" in inst && "accounts" in inst && "data" in inst) {
          // CompiledInstruction (legacy & v0, data base58 string)
          programId = accountKeys[inst.programIdIndex];
          keys = inst.accounts.map((i: number) => ({ pubkey: accountKeys[i] }));
          data = Buffer.from(inst.data, "base64");
        } else if ("programId" in inst && "keys" in inst && "data" in inst) {
          // ParsedInstruction or TransactionInstruction
          programId = inst.programId;
          keys = inst.keys;
          data = inst.data;
        } else {
          continue;
        }
      } catch (e) {
        continue;
      }

      // Create a faux TransactionInstruction for decodeOnlyTransfer compatibility
      const txnInst: TransactionInstruction = {
        programId,
        keys,
        data,
      } as TransactionInstruction;

      const transfer = decodeOnlyTransfer(txnInst);
      if (transfer) transfers.push(transfer);
    }

    results.push({
      signature: sig.signature,
      slot: sig.slot,
      transfers,
    });
  }

  return results;
}
