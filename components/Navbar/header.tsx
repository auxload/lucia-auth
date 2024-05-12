"use client";
import Link from "next/link";
import Navigation from "./navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import MobileNavigation from "./mobileNavigation";
import { usePathname } from "next/navigation";
import { useSession } from "@/contexts/session-provider";
import FormButton from "../FormButton";
import { signOut } from "@/app/actions/auth.actions";
import { ReactNode } from "react";
import { ModeToggle } from "../darkThemeButton";

const Header = ({ children }: { children: ReactNode }) => {
  const path = usePathname();
  if (
    path === "/sign-up" ||
    path === "/sign-in" ||
    path === "/reset-password" ||
    path === "/verify-email"
  ) {
    return null;
  }
  return (
    <header className="bg-background/80 backdrop-blur-sm  border-b sticky top-0 z-20">
      <div className="container h-16 flex items-center ">
        <Logo />
        <Navigation/>
        <CTA className="hidden md:flex gap-2" hide="hidden " />
        <MobileNavigation />
        {children}
      </div>
    </header>
  );
};

export function Logo() {
  return (
    <div className="flex  gap-2 mr-8 items-center">
      <Link href={"/"}>
        <FlagIcon className="h-8 w-8" />
      </Link>
    </div>
  );
}
export function CTA({
  className,
  hide,
}: {
  className?: string;
  hide?: string;
}) {
  const { user } = useSession();
  if (user) {
    return (
      <form className={cn("", hide)} action={signOut}>
        <FormButton
          variant="outline"
          defaultText="Sign out"
          pendingText="Signing out..."
        />
      </form>
    );
  }
  return (
    <div className={cn("", className)}>
      <ModeToggle/>
      <Link
        className={cn(
          buttonVariants({ size: "sm", variant: "default" }),
          "text-xs ml-3"
        )}
        href={"/sign-in"}
      >
        Sign In
      </Link>
    </div>
  );
}

function FlagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

export default Header;
