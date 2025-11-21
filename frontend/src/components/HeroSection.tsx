import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div>
      <div className="flex items-center justify-center flex-col gap-4 mt-56 mb-32">
        <Link href={"/builder"}>
          <Button
            variant={"secondary"}
            className="bg-[#522AA5] hover:bg-[#5128a5d9] text-white cursor-pointer"
          >
            Builder
          </Button>{" "}
        </Link>
        <Link href={"/tipper"}>
          <Button variant={"outline"} className="text-black cursor-pointer">
            Tipper
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
