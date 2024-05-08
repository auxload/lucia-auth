"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { navLinks } from "@/lib/siteConfig";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/session-provider";

export const navigationMenuTriggerStyle = cva("px-2 hover:text-foreground ");
export const navigationMenuActiveStyle = cva("text-foreground ");
const navigationPlacementVariants = cva("", {
  variants: {
    placement: {
      default: "mr-auto",
      right: "ml-auto",
      middle: "m-auto",
      left: "mr-auto",
    },
  },
  defaultVariants: {
    placement: "default",
  },
});

const Navigation = ({
  placement,
}: {
  placement?: "default" | "right" | "middle" | "left" | null | undefined;
}) => {
  const path = usePathname();
  const { user } = useSession();
  return (
    <NavigationMenu
      className={cn(
        navigationPlacementVariants({ placement: placement }),
        "hidden md:block"
      )}
    >
      <NavigationMenuList className="text-foreground/50 text-sm">
        {navLinks.map((link) => {
          if (link.secure && !user) {
            return null;
          }
          return (
            <NavigationMenuItem key={link.label}>
              <Link href={link.path} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    `${path === link.path && navigationMenuActiveStyle()}`
                  )}
                >
                  {link.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
