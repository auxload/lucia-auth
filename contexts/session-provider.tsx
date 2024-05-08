"use client";
import { Session, User } from "lucia";
import { ReactNode, createContext, useContext } from "react";

interface SessionProviderProps {
  user: User | null;
  session: Session | null;
}

const SessionContext = createContext<SessionProviderProps>({} as SessionProviderProps);

export const SessionProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: SessionProviderProps;
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) {
    throw new Error("No context Wrapper Provided");
  }
  return sessionContext;
};
