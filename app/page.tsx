import { Button, buttonVariants } from "@/components/ui/button";
import { validateRequest } from "@/lib/lucia/lucia";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Spotlight } from "@/components/Spotlight";
import { CopyToClipboard } from "@/components/CopyToClipboard";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Section from "@/components/layouts/section";
import Wrapper from "@/components/layouts/wrapper";

export default async function Home() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }
  return (
    <Section className="grid place-content-center">
      <Wrapper className="text-center flex gap-4 flex-col items-center">
        <h1 className="text-7xl font-bold">
          Auth Template with
          <span className="text-primary underline">Lucia</span>
        </h1>
        <Link
          className={cn(buttonVariants({ variant: "default" }), "w-max")}
          href={"/dashboard"}
        >
          Get Started
        </Link>
      </Wrapper>
    </Section>
  );
}
