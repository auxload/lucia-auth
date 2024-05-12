"use server";
import { generateId } from "lucia";
import db from "@/db";
import {
  generateEmailVerificationCode,
  lucia,
  validateRequest,
  verifyVerificationCode,
} from "@/lib/lucia/lucia";
import { cookies } from "next/headers";
import * as argon2 from "argon2";
import { z } from "zod";
import { isWithinExpirationDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";
import { redirect } from "next/navigation";
import {
  signUpFormSchema,
  signInFormSchema,
  verifyCodeSchema,
  forgotPasswordFormSchema,
} from "@/schemas/auth.schema";
import { resetPasswordFormSchema } from "../profile/settings/page";
import { sendEmail } from "@/lib/nodemailer";
import { createPasswordResetToken } from "@/lib/lucia/lucia";
type AuthAction = { success: boolean; message: string };

export async function signup(
  data: z.infer<typeof signUpFormSchema>
): Promise<AuthAction> {
  const parsed = signUpFormSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      message: err.formErrors[0],
    };
  }

  const { email, password, username } = parsed.data;

  const existingUserByUsername = await db.user.findUnique({
    where: {
      username,
    },
  });

  const existingUserByEmail = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUserByUsername || existingUserByEmail) {
    return {
      message: "This user allready exist!",
      success: false,
    };
  }

  const userId = generateId(21);
  const hashedPassword = await argon2.hash(password);

  try {
    await db.user.create({
      data: {
        id: userId,
        username: username,
        password: hashedPassword,
        email: email,
      },
    });
  } catch (error) {
    return {
      success: false,
      message: JSON.stringify(error),
    };
  }

  const verificationCode = await generateEmailVerificationCode(userId, email);
  await sendEmail(verificationCode, email);
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return {
    message: "Please check your email!",
    success: true,
  };
}
export async function login(
  data: z.infer<typeof signInFormSchema>
): Promise<AuthAction> {
  const parsed = signInFormSchema.safeParse(data);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      message: err.formErrors[0],
    };
  }

  const { username, password } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: {
      username,
    },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "Incorrect email or password",
    };
  }

  if (!existingUser || !existingUser?.password) {
    return {
      success: false,
      message: "Incorrect email or password",
    };
  }

  const validPassword = await argon2.verify(existingUser.password, password);
  if (!validPassword) {
    return {
      success: false,
      message: "Incorrect email or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return { success: true, message: "Logged In successfuly!" };
}
export const signOut = async (): Promise<AuthAction> => {
  try {
    const { session } = await validateRequest();
    if (!session) {
      return {
        success: false,
        message: "Session not found!",
      };
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect("/");
  } catch (error: any) {
    return {
      success: false,
      message: "Error signing out!",
    };
  }
};

export const verifyEmail = async (
  verifyAccountCode: z.infer<typeof verifyCodeSchema>
) => {
  const parsed = verifyCodeSchema.safeParse(verifyAccountCode);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      message: err.formErrors[0],
    };
  }
  const { code } = parsed.data;
  const { session } = await validateRequest();
  if (!session) {
    return {
      success: false,
      message: "No session found!",
    };
  }
  const { user } = await lucia.validateSession(session.id);
  if (!user) {
    return {
      success: false,
      message: "No user found!",
    };
  }
  const validCode = await verifyVerificationCode(user, code);

  if (!validCode) {
    return {
      success: false,
      message: "Wrong verifcation code or has expired!",
    };
  }

  await lucia.invalidateUserSessions(user.id);

  await db.user.update({
    where: { id: user.id },
    data: {
      email_verified: true,
    },
  });
  const newSession = await lucia.createSession(user.id, {});

  const sessionCookie = lucia.createSessionCookie(newSession.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return {
    success: true,
    message: "Account verified!",
  };
};

export const sendforgotPasswordEmailCode = async (
  forgottenUserPassword: z.infer<typeof forgotPasswordFormSchema>
) => {
  const parsed = forgotPasswordFormSchema.safeParse(forgottenUserPassword);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      message: err.formErrors[0],
    };
  }
  const { email } = parsed.data;
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });
  if (!user || !user.email_verified) {
    return {
      success: true,
      message: "Email sent!",
    };
  }
  const verificationToken = await createPasswordResetToken(user.id);
  const verificationLink =
    "https://lucia-auth-ten.vercel.app/reset-password/" + verificationToken;
  await sendEmail(verificationLink, email);
  return {
    success: true,
    message: "Email sent!",
  };
};
export const resetForgottenPassword = async ({
  values,
}: {
  values: { token: string; password: string };
}) => {
  const verificationToken = values.token;
  const tokenHash = encodeHex(
    await sha256(new TextEncoder().encode(verificationToken))
  );
  const token = await db.passwordResetTokens.findUnique({
    where: { token_hash: tokenHash },
  });
  if (token) {
    await db.passwordResetTokens.delete({ where: { token_hash: tokenHash } });
  }

  if (!token) {
    return {
      success: false,
      message: "Invalid Token",
    };
  }
  if (!isWithinExpirationDate(token.expires_at)) {
    try {
      await db.passwordResetTokens.delete({
        where: {
          token_hash: tokenHash,
        },
      });
      return {
        success: false,
        message: "Invalid Token",
      };
    } catch (error) {
      return {
        success: false,
        message: "Token has exired",
      };
    }
  }
  await lucia.invalidateUserSessions(token.user_id);
  const passwordHash = await argon2.hash(values.password);
  await db.user.update({
    where: {
      id: token.user_id,
    },
    data: {
      password: passwordHash,
    },
  });
  return {
    success: true,
    message: "Done",
  };
};
export const isForgotPasswordTokenValid = async (paramsToken: string) => {
  const tokenHash = encodeHex(
    await sha256(new TextEncoder().encode(paramsToken))
  );
  const token = await db.passwordResetTokens.findUnique({
    where: { token_hash: tokenHash },
  });
  if (!token) {
    return {
      success: false,
      message: "Invalid token!",
    };
  }
  if (!isWithinExpirationDate(token.expires_at)) {
    await db.passwordResetTokens.delete({
      where: {
        token_hash: tokenHash,
      },
    });
    return {
      success: false,
      message: "Invalid token!",
    };
  }
  return {
    success: true,
    message: "Token valid!",
  };
};

export async function resendCodeVerification() {
  const { user } = await validateRequest();
  if (!user) {
    return {
      success: false,
      message: "Session has expired",
    };
  }

  const verificationCode = await generateEmailVerificationCode(
    user.id,
    user.email
  );

  await sendEmail(verificationCode, user.email);
}

// Settings
export async function updatePersonalInfo(username: string) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      success: false,
      message: "Neautorizat",
    };
  }
  await db.user.update({
    where: { username: user.username },
    data: { username: username },
  });
  return {
    success: true,
    message: "Your username and Email has been changed ✅👍",
  };
}

export async function resetPassword(
  values: z.infer<typeof resetPasswordFormSchema>
) {
  try {
    resetPasswordFormSchema.parse(values);
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        success: false,
        message: error.message,
      };
  }
  const { user } = await validateRequest();
  if (!user) {
    return {
      success: false,
      message: "Neautorizat",
    };
  }

  const existUser = await db.user.findUnique({
    where: { username: user.username },
  });
  if (!existUser) {
    return {
      success: false,
      message: "User-ul nu a fost gasit",
    };
  }

  const isValidPassword = await argon2.verify(
    existUser.password,
    values.currentPassword
  );

  if (!isValidPassword) {
    return {
      success: false,
      message: "Wrong Password",
    };
  }

  const hashedPassword = await argon2.hash(values.newPassword);

  await db.user.update({
    where: {
      username: user.username,
    },
    data: {
      password: hashedPassword,
    },
  });
  return {
    success: true,
    message: "Password changed! ✅👍",
  };
}

export async function deleteAccount() {
  const { user, session } = await validateRequest();
  if (!user || !session) {
    return {
      success: false,
      message: "Neautorizat",
    };
  }
  await db.user.delete({
    where: { username: user?.username },
  });

  await lucia.invalidateSession(session.id);
  return redirect("/");
}
