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
import ParticlesComponent from "@/components/particles";
import clsx from "clsx";

export default async function Home() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }
  return (
    <>
      {/* <Section className="flex justify-center items-start   min-h-[90vh] md:min-h-[37rem] ">
      <Wrapper className="text-center flex gap-5 flex-col items-center">
        <h1 className=" text-5xl md:text-7xl font-bold">
          Auth Template with {""}
          <span className="text-primary underline">Lucia Auth</span>
        </h1>
        <Link
          className={cn(buttonVariants({ variant: "default" }), "w-max")}
          href={"/dashboard"}
        >
          Get Started
        </Link>
      </Wrapper>
    </Section>
    <Section className="h-[30rem] bg-accent">
    </Section> */}
      <Section className="min-h-[90vh] md:min-h-[35rem] w-full flex md:items-center md:justify-center  antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <ParticlesComponent id="particles" sex={"#FFFFFF"}/>

        <Wrapper className=" relative z-10 w-full  flex flex-col items-center justify-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-center bg-clip-text  bg-opacity-50">
            The template for building{" "}
            <span className="text-primary underline">fullstack</span>{" "}
            applications
          </h1>

          <p className="mt-4 font-normal text-base text-foreground/70 max-w-lg text-center mx-auto">
            This is a template for building fullstack applications with{" "}
            <span className="font-bold text-primary">Next.js, </span>
            <span className="font-bold text-primary">Lucia, </span>
            <span className="font-bold text-primary">Prisma, </span>and
            <span className="font-bold text-primary"> Neon DB</span>.
          </p>
          <Link
            href={"/dashboard"}
            className={cn("mt-4", buttonVariants({ variant: "default" }))}
          >
            Get started
          </Link>
        </Wrapper>
      </Section>
    </>
  );
}
