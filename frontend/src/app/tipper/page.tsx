"use client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { checkCreatorVaultAccount } from "@/src/lib/anchor/services";
import { getConnection } from "@/src/lib/solana/connection";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import React, { useState } from "react";
const dmsans = DM_Sans({
  subsets: ["latin"],
});
const page = () => {
  const [searchAdd, setSearchAdd] = useState("");
  const [creatorAdd, setCreatorAdd] = useState<{
    isExist: boolean;
    pdaAcc: null | string;
    message: string;
  }>({ isExist: false, pdaAcc: null, message: "" });

  const handleTipper = async () => {
    console.log("Handling Tipper");
    console.log("Search Add", searchAdd);

    const creatorDetails = await checkCreatorVaultAccount(
      searchAdd,
      getConnection()
    );
    console.log({ creatorDetails });

    setCreatorAdd(creatorDetails);
  };
  return (
    <>
      <div
        className={`text-black  flex items-center  flex-col justify-between ${dmsans.className} mt-20 `}
      >
        <div className="flex items-center justify-evenly w-full max-w-[50vw] gap-2">
          <Input
            type="text"
            className="w-full"
            onChange={(e) => setSearchAdd(e.target.value)}
            value={searchAdd}
          />

          <Button disabled={!searchAdd} onClick={handleTipper}>
            Search
          </Button>
        </div>

        {creatorAdd.isExist ? (
          <div className="flex p-3  items-center justify-start w-full mt-32">
            <h1>Tip Here </h1>
            <Link href={`/tip/${creatorAdd.pdaAcc}`}>{creatorAdd.pdaAcc}</Link>
          </div>
        ) : (
          creatorAdd.message
        )}
      </div>
    </>
  );
};

export default page;
