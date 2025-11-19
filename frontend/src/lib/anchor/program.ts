import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { AnchorProject } from "./anchor_project_idl";
import idl from "./anchor_project_idl.json";

export function getProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  if (!wallet) return null;

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  setProvider(provider);

  const program = new Program(idl as AnchorProject, {
    connection,
  });

  return program;
}
