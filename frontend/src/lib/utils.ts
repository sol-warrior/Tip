import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(text: string) {
  const pre = text.slice(0, 5);
  const last = text.slice(-5);

  const format = `${pre}...${last}`;

  console.log("Format : ", format);
  return format;
}
