"use client";
import { useSession } from "@/contexts/session-provider";
import React from "react";

const ClientExample = () => {
  const { user } = useSession();
  if (!user) {
    return null;
  }
  return (
    <div>
      <h1 className="text-4xl font-bold text-white">Welcome {user.username}</h1>
      <p className="text-white text-center">
        You can now access protected routes
      </p>
    </div>
  );
};

export default ClientExample;
