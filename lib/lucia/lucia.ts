import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { Session, User } from "lucia";
import adapter from "./adapter";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import db from "@/db";
import { authConfig } from "@/auth.config";
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(authConfig.sessionExpInterval, "d"),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      emailVerified: attributes.email_verified,
      email: attributes.email,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }
    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);

export async function generateEmailVerificationCode(
  userId: string,
  email: string
): Promise<string> {
  try {
    await db.emailVerification.delete({
      where: {
        user_id: userId,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      console.log();
    }
  }

  const code = generateRandomString(8, alphabet("0-9"));
  await db.emailVerification.create({
    data: {
      user_id: userId,
      email,
      code,
      expires_at: createDate(new TimeSpan(authConfig.tokenVerifyEmail, "m")),
    },
  });
  return code;
}

export async function verifyVerificationCode(
  user: User,
  code: string
): Promise<boolean> {
  const databaseCode = await db.emailVerification.findUnique({
    where: {
      user_id: user.id,
    },
  });
  if (!databaseCode || databaseCode.code !== code) {
    return false;
  }
  await db.emailVerification.delete({
    where: { user_id: user.id },
  });
  // await db.table("email_verification_code").where("id", "=", code.id).delete();
  // await db.commit();

  if (!isWithinExpirationDate(databaseCode.expires_at)) {
    return false;
  }
  if (databaseCode.email !== user.email) {
    return false;
  }
  return true;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  email: string;
  email_verified: boolean;
}
