import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/user-auth-form-sign-up";
import AuthLayout from "@/components/layouts/auth-layout";
import { validateRequest as getUser } from "@/lib/lucia/lucia";
async function page() {
  const { user } = await getUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <AuthLayout
      labelExtLink="Sign In"
      extLink="/sign-in"
      title="Sign Up
    "
      desc="Enter your credentials below to sign up."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
export default page;
