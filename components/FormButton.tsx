"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export default function FormButton({
  className,
  variant = "outline",
  pendingText,
  defaultText,
  isPending,
}: {
  className?:string
  variant: "outline" | "default" | "link";
  pendingText: string;
  defaultText: string;
  isPending?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button className={cn(className)} variant={variant} type="submit" disabled={pending || isPending}>
      {pending || isPending ? pendingText : defaultText}
    </Button>
  );
}
