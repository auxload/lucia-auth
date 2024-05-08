"use client";
import { ConfirmResetPassword, ValidToken } from "@/app/actions/auth.actions";
import React, { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
export const confirmPasswordResetformSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    newConfirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.newPassword === data.newConfirmPassword, {
    message: "Passwords do not match",
    path: ["newConfirmPassword"],
  });
const ClientFORM = () => {
  const router = useRouter();
  const params = useParams();
  // 1. Define your form.
  const form = useForm<z.infer<typeof confirmPasswordResetformSchema>>({
    resolver: zodResolver(confirmPasswordResetformSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(
    values: z.infer<typeof confirmPasswordResetformSchema>
  ) {
    const res = await ConfirmResetPassword({
      values: { token: params.token as string, password: values.newPassword },
    });
    if (res.success) {
      toast({
        variant: "default",
        description: res.message,
      });
      setTimeout(() => {
        router.push("/sign-in");
      }, 1000);
    } else {
      toast({
        variant: "destructive",
        description: res.message,
      });
      setTimeout(() => {
        router.push("/reset-password");
      }, 1000);
      // router.push("/reset-password");
    }
  }
  return (
    <div className="flex  items-center justify-center  py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight ">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below to reset your account password.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newConfirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              className="w-full"
              type="submit"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ClientFORM;
