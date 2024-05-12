import React from "react";
import ClientFORM from "./client-form";
import { isForgotPasswordTokenValid } from "@/app/actions/auth.actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const page = async ({ params }: { params: { token: string } }) => {
  const res = await isForgotPasswordTokenValid(params.token);
  if (res.success === false) {
    return (
      <div className="grid place-content-center">
        <h1 className="text-xl mb-2 font-bold ">
          Reset Password Token is Invalid or has expired
        </h1>

        <Link
          className={cn(buttonVariants({ variant: "default" }), "")}
          href={"/reset-password"}
        >
          Try Again
        </Link>
      </div>
    );
  }
  return <ClientFORM />;
};

export default page;
