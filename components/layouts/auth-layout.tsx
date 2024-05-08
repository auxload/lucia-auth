import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowBigLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React, { HTMLAttributes } from "react";
import { Logo } from "../Navbar/header";
// import Logo from "../brand-logo";

interface AuthLayoutProp extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title: string;
  desc: string;
  extLink: "/sign-in" | "/sign-up";
  labelExtLink: "Sign In" | "Sign Up";
}

const AuthLayout = ({
  title,
  desc,
  extLink,
  labelExtLink,
  className,
  children,
  ...props
}: AuthLayoutProp) => {
  return (
    <>
      <div className=" relative  min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col  p-10  lg:flex border-r bg-accent ">
        <div
          // href={extLink}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute left-4 top-4 md:left-8 md:top-8 z-70"
          )}
        >
          <Logo />
        </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-8">
        <div
          // href={extLink}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute left-4 top-4 md:left-8 md:top-8 z-70 lg:hidden"
          )}
        >
          <Logo />
        </div>
          <div className="mx-auto flex flex-col justify-center space-y-6 w-[80vw] md:w-[400px] ">
            <div className="flex flex-col space-y-2 text-center ">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{desc} </p>
            </div>
            {children}

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
