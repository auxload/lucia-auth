import { toast } from "@/components/ui/use-toast";
import { signUpFormSchema } from "@/schemas/auth.schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { boolean, z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


