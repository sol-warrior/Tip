import { PublicKey } from "@solana/web3.js";
import tippingIdl from "./anchor_project_idl.json";

const PROGRAM_ID = new PublicKey(tippingIdl.address);

export function getCreatorVaultPda(creator: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), creator.toBuffer()],
    PROGRAM_ID
  );
}
