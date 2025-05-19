// apps/frontend/lib/utils.ts
export const cn = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ")



// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }
