"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import placeholder from "@/public/userplaceholder.webp";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navLinks as navConfig } from "@/lib/siteConfig";
import { usePathname } from "next/navigation";
import { CTA, Logo } from "./header";
import {
  navigationMenuActiveStyle,
  navigationMenuTriggerStyle,
} from "./navigation";

import Profile from "../Profile/profile";
import { Avatar } from "@radix-ui/react-avatar";
import { useSession } from "@/contexts/session-provider";
import { AvatarFallback, AvatarImage } from "../ui/avatar";

const MobileNavigation = () => {
  const { user } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <div className="md:hidden ml-auto">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger>
          <MenuIcon className=" top-1 relative" />
        </SheetTrigger>
        <SheetContent
          side={"top"}
          className="py-9 px-6 overflow-auto gap-10 flex flex-col "
        >
          <SheetHeader>
            <Link href={"/profile/settings"}>
              {user && (
                <div onClick={() => setSheetOpen(false)} className="flex  items-center pl-1 gap-3">
                  <Avatar className="size-12 ">
                    <AvatarImage
                      className="rounded-full"
                      src={placeholder.src}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-start items-start">
                    <span className="text-xl font-bold">{user.username}</span>
                    <span className="text-xs text-foreground/50 underline">Settings</span>
                  </div>
                </div>
              )}
            </Link>
          </SheetHeader>

          <Nav setOpen={setSheetOpen} />
          <CTA className="grid gap-2" />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export const Nav = ({ setOpen }: { setOpen: any }) => {
  const { user } = useSession();
  const path = usePathname();
  return (
    <NavigationMenu className="max-w-none block " orientation="vertical">
      <NavigationMenuList className="max-w-none block space-x-0 space-y-4 text-accent-foreground/50 text-md">
        {navConfig.map((item) => {
          if (item.secure && !user) {
            return null;
          }
          return (
            <ItemLink
              setOpen={setOpen}
              active={path}
              label={item.label}
              path={item.path}
              key={item.label}
            />
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const ItemLink = ({
  label,
  path,
  active,
  setOpen,
}: {
  label: string;
  path: string;
  active: string;
  setOpen: any;
}) => {
  return (
    <NavigationMenuItem
      className="block w-full max-w-none"
      onClick={() => setOpen(false)}
    >
      <Link href={path!} legacyBehavior passHref>
        <NavigationMenuLink
          className={cn(
            navigationMenuTriggerStyle(),
            `max-w-none w-full justify-start ${
              active === path && navigationMenuActiveStyle()
            }`
          )}
        >
          {label}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};

export default MobileNavigation;
