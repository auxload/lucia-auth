import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileAvatar from "./Avatar";
import { validateRequest } from "@/lib/lucia/lucia";
import FormButton from "../FormButton";
import { signOut } from "@/app/actions/auth.actions";
import Link from "next/link";

const Profile = async () => {
  const { user } = await validateRequest();
  if (!user) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden md:flex">
        <ProfileAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex items-center p-1">
          <ProfileAvatar className="size-12" />
          <div>
            <DropdownMenuLabel className="pb-0 text-md">
              {user.username}
            </DropdownMenuLabel>
            <DropdownMenuLabel className=" pt-0 text-xs text-foreground/50">
              {user.email}
            </DropdownMenuLabel>
          </div>
        </div>
        <DropdownMenuSeparator />
        {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
        <DropdownMenuItem>
          <Link href={"/profile/settings"}>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <form action={signOut}>
            <FormButton
              variant="link"
              defaultText="Log Out"
              className="h-auto p-0 text-destructive"
              pendingText="Signing out..."
            />
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;
