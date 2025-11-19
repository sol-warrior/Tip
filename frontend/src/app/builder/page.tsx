"use client";
import { Button } from "@/src/components/ui/button";
import { DM_Sans } from "next/font/google";
import React, { useState } from "react";

const dmsans = DM_Sans({
  subsets: ["latin"],
});
const page = () => {
  const [isActivated, setIsActivated] = useState(true);
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
          <p>Total tips : 10 SOL </p>
          <p>Balance left : 2 left</p>
        </div>
      </div>

      <div className="flex items-center justify-center h-[45vh]">
        {!isActivated ? (
          <Button
            variant={"secondary"}
            className="bg-[#522AA5] hover:bg-[#5128a5d9] text-white font-semibold cursor-pointer"
          >
            Activate Your Wallet
          </Button>
        ) : (
          "eee"
        )}
      </div>
    </>
  );
};

export default page;
