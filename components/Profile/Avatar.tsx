import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { validateRequest } from "@/lib/lucia/lucia";
import placeholder from "@/public/userplaceholder.webp";
import { cn } from "@/lib/utils";
const ProfileAvatar = async ({ className }: { className?: string }) => {
  const { user } = await validateRequest();
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={placeholder.src} />
      <AvatarFallback>{user?.username}</AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
