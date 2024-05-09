import { Button, buttonVariants } from "@/components/ui/button";
import { validateRequest } from "@/lib/lucia/lucia";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Spotlight } from "@/components/Spotlight";
import { CopyToClipboard } from "@/components/CopyToClipboard";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export default async function Home() {
  const githubUrl =
    "https://github.com/webdiego/next.js-drizzle-turso-lucia.git";

  const { user } = await validateRequest();
  if (user) {
    return redirect("/dashboard");
  }

  return (
    <div className=" w-full flex md:items-center md:justify-center antialiased  relative overflow-hidden">
      <div className="p-4 max-w-5xl mx-auto relative z-10 w-full pt-20 md:pt-0 flex flex-col items-center justify-center">
        <h1 className="text-5xl lg:text-7xl font-bold text-center    ">
          Auth Template with lucia
        </h1>

        <p className="mt-4 font-normal text-base  max-w-lg text-center mx-auto">
          Includes Sign In,Sign Up,Forgot Password,Verify Account via Email and
          Google auth{" "}
        </p>
        <div className="mt-10 flex flex-col items-center ">
          <p className=" font-semibold text-sm text-center">
            Just try the template, sign up and start building your app.
          </p>
          <Link
            className={cn(buttonVariants({ variant: "default" }),"m-5")}
            href={"/dashboard"}
          >
            See your dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
