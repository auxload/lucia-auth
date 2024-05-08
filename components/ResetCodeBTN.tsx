"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export default function ResetCodeBTN({
  className,
  variant = "outline",
  pendingText,
  defaultText,
}: {
  className?:string
  variant: "outline" | "default" | "link";
  pendingText: string;
  defaultText: string;
  isPending?: boolean;
}) {
  const [isPending,setIsPending] = useState(false)
  // const { pending } = useFormStatus();
  return (
    <Button className={cn(className)} variant={variant} onSubmit={() => setIsPending(true)} type="submit" disabled={isPending}>
      {isPending ? pendingText : defaultText}
    </Button>
  );
}
