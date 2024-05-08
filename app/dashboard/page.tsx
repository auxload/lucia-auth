import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/lucia/lucia";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth.actions";
import { TargetIcon } from "@radix-ui/react-icons";
import FormButton from "@/components/FormButton";
import ClientExample from "@/components/ClientExample";
export default async function ProfilePage() {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/sign-in");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }

  return (
    <main className="flex  flex-col items-center justify-center space-y-8">
      <div className=" px-2 py-1 rounded-lg flex items-center">
        <TargetIcon className="w-4 h-4 mr-2" />
        <p className="font-thin text-sm">
          Protected <span className="font-bold">Server Component</span> route
        </p>
      </div>
      <div>
        <h1 className="text-4xl font-bold ">Welcome {user.username}</h1>
        <p className=" text-center">You can now access protected routes</p>
      </div>
    </main>
  );
}
