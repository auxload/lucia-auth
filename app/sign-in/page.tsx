// import { SignInForm } from "@/components/SignInForm";
import AuthLayout from "@/components/layouts/auth-layout";
import { SignInForm } from "@/components/user-auth-form-sign-in";
import { validateRequest } from "@/lib/lucia/lucia";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const { user } = await validateRequest();

  if (user) {
    return redirect("/dashboard");
  }
  return (
    <AuthLayout
      labelExtLink="Sign Up"
      extLink="/sign-up"
      title="Sign in"
      desc="Enter your credentials below to sign in."
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default page;
