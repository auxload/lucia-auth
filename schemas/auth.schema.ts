import { z } from "zod";
export const signUpFormSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const signInFormSchema = z.object({
  username: z.string().min(2).max(50),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});


export const verifyCodeSchema = z.object({
  code: z.string().min(8, "Enter the code you recived in your email").max(9),
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().email(),
});