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
import { Prisma } from "@prisma/client";
import {
  signUpFormSchema,
  signInFormSchema,
  verifyCodeSchema,
  forgotPasswordFormSchema,
} from "@/schemas/auth.schema";
import { authConfig } from "@/auth.config";
import { resetPasswordFormSchema } from "../profile/settings/page";
import { sendEmail } from "@/lib/nodemailer";
// import { generateIdFromEntropySize } from "lucia";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

type AuthAction = { success: boolean; message: string };

export const signUp = async (
  credentials: z.infer<typeof signUpFormSchema>
): Promise<AuthAction> => {
  // Validate data
  const {
    success,
    error,
    data: validatedData,
  } = signUpFormSchema.safeParse(credentials);
  if (!success) {
    return {
      success: success,
      message: error.issues[0].message,
    };
  }

  // Check if user already exists
  const userAlreadyExist = await db.user.findUnique({
    where: {
      username: validatedData.username,
    },
  });

  if (userAlreadyExist) {
    return {
      success: false,
      message: "User allready exist",
    };
  }

  // Hasing password
  const hashedPassword = await argon2.hash(validatedData.password);
  const userId = generateId(15);

  try {
    // Create User in db
    await db.user.create({
      data: {
        id: userId,
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
      },
    });

    // Generate verification Code
    const verificationCode = await generateEmailVerificationCode(
      userId,
      validatedData.email
    );

    // sends email
    await sendEmail(verificationCode, validatedData.email);

    //Creating session
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return {
      success: true,
      message: "Account created successfuly!",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "An error has ocuer! Please try again",
    };
  }
};

// export const signIn = async (
//   credentials: z.infer<typeof signInFormSchema>
// ): Promise<AuthAction> => {
//   // Validate data
//   try {
//     signInFormSchema.parse(credentials);
//   } catch (error) {
//     if (error instanceof z.ZodError)
//       return {
//         success: false,
//         message: error.message,
//       };
//   }

//   const existingUser = await db.user.findUnique({
//     where: {
//       username: credentials.username,
//     },
//   });

//   if (!existingUser) {
//     return {
//       success: false,
//       message: "User not found",
//     };
//   }

//   const isValidPassword = await argon2.verify(
//     existingUser.password,
//     credentials.password
//   );

//   if (!isValidPassword) {
//     return {
//       success: false,
//       message: "Incorrect credentials",
//     };
//   }

//   const session = await lucia.createSession(existingUser.id, {});

//   const sessionCookie = lucia.createSessionCookie(session.id);

//   cookies().set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes
//   );

//   return {
//     success: true,
//     message: "Logged in successfully!",
//   };
// };

export async function login(
  data: z.infer<typeof signInFormSchema>
): Promise<{ success: boolean; message: string }> {

  
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
  return {success:true,
  message:"Logged In successfuly!✅"};
}

export const signOut = async (): Promise<AuthAction> => {
  try {
    const { session } = await validateRequest();
    if (!session) {
      return {
        success: false,
        message: "Unauthorized",
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
      message: error?.message,
    };
  }
};

export const verifyAccount = async (
  verifyAccountCode: z.infer<typeof verifyCodeSchema>
) => {
  try {
    verifyCodeSchema.parse(verifyAccountCode);
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        success: false,
        message: error.message,
      };
  }

  const { session } = await validateRequest();
  if (!session) {
    return {
      success: false,
      message: "Neautorizat",
    };
  }
  const { user } = await lucia.validateSession(session.id);
  if (!user) {
    return {
      success: false,
      message: "Neautorizat",
    };
  }
  const validCode = await verifyVerificationCode(user, verifyAccountCode.code);

  if (!validCode) {
    return {
      success: false,
      message: "Wrong verifcation code or has expired",
    };
  }

  await lucia.invalidateUserSessions(user.id);

  await db.user.update({
    where: { id: user.id },
    data: {
      email_verified: true,
    },
  });
  const session2 = await lucia.createSession(user.id, {});

  const sessionCookie = lucia.createSessionCookie(session2.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
  return {
    success: true,
    message: "Account verified!",
  };
};

export const forgotPassword = async (
  forgottenUserPassword: z.infer<typeof forgotPasswordFormSchema>
) => {
  const user = await db.user.findUnique({
    where: {
      email: forgottenUserPassword.email,
    },
  });
  if (!user || !user.email_verified) {
    return {
      success: false,
      message: "User not find with this email",
    };
  }

  const verificationToken = await createPasswordResetToken(user.id);
  const verificationLink =
    "https://lucia-auth-ten.vercel.app/reset-password/" + verificationToken;

  // await sendPasswordResetToken(email, verificationLink);
  console.log(verificationLink);
  await sendEmail(verificationLink, user.email);
  return {
    success: true,
    message: "Password updated!",
  };
};
export const ConfirmResetPassword = async ({
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
export const ValidToken = async ({ values }: { values: { token: string } }) => {
  const verificationToken = values.token;
  const tokenHash = encodeHex(
    await sha256(new TextEncoder().encode(verificationToken))
  );
  const token = await db.passwordResetTokens.findUnique({
    where: { token_hash: tokenHash },
  });
  if (!token) {
    return {
      success: false,
      message: "Invalid Token ❌",
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
      message: "Invalid Token",
    };
  }
  return {
    success: true,
    message: "Valid Token ✅",
  };
};

async function createPasswordResetToken(userId: string): Promise<string> {
  const tokenId = generateId(40); // 40 character
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));
  await db.passwordResetTokens.create({
    data: {
      token_hash: tokenHash,
      user_id: userId,
      expires_at: new Date(
        new Date().setTime(
          new Date().getTime() +
            authConfig.tokenForgotPasswordExpInterval * 60 * 1000
        )
      ),
    },
  });
  return tokenId;
}

export async function resendCodeVerification() {
  // Generate verification Code
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
