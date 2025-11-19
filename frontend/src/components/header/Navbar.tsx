import React from "react";
import ConnectWallet from "./WalletConnect";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="flex  items-center justify-between w-full">
      <Link href={"/"}>
        <h1 className="text-2xl font-semibold text-[#000000ba]">Tipping</h1>
      </Link>
      <ConnectWallet />
    </div>
  );
};

export default Navbar;
