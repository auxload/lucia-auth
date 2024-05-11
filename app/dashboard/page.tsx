import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/lucia/lucia";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth.actions";
import { TargetIcon } from "@radix-ui/react-icons";
import FormButton from "@/components/FormButton";
import ClientExample from "@/components/ClientExample";
import Section from "@/components/layouts/section";
import Wrapper from "@/components/layouts/wrapper";
export default async function ProfilePage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/sign-in");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  return (
    <Section className="flex flex-col items-center justify-center space-y-8">
      <Wrapper className="grid justify-center gap-2">
        <div className="flex gap-2 items-center m-auto">
          <TargetIcon className="w-4 h-4" />
          <p className="font-thin text-sm">
            Protected <span className="font-bold">Server Component</span> route
          </p>
        </div>
        <h1 className="text-4xl font-bold text-center">Welcome {user.username}</h1>
        <p className="text-center text-foreground/50">You can now access protected routes</p>
      </Wrapper>
    </Section>
  );
}
