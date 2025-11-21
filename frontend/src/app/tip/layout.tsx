import Navbar from "@/src/components/header/Navbar";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className=" h-full bg-zinc-50 font-sans py-6 px-12">
      <Navbar />
      {children}
    </div>
  );
};

export default layout;
