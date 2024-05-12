"use client";
import React, { useEffect, useState } from "react";
import {  sendforgotPasswordEmailCode } from "../actions/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
export const resetPasswordFormSchema = z.object({
  email: z.string().email(),
});
const Page = () => {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });
  async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    const res = await sendforgotPasswordEmailCode(values);

    if (res.success === false) {
      toast({
        variant: "destructive",
        description: res.message,
      });
      // setIsPending(false);
    } else if (res.success) {
      toast({
        variant: "default",
        description: "Check your email for the password reset link ✅",
      });
      setEmailSent(true);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center  ">
      {!emailSent ? (
        <div className="w-full max-w-md  space-y-4">
          <div className="space-y-2 text-center">
            <h1
              className="text-3xl font-bold
          "
            >
              Forgot Password
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your email address and we&aposll send you a link to reset your
              password.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="w-full"
                // variant={"secondary"}
              >
                Submit
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h1
            className="text-3xl font-bold
        "
          >
            We&aposve sent you an email with your reset password code
          </h1>
          <Link
            className={buttonVariants({
              variant: "secondary",
              className: "w-max",
            })}
            href={"/"}
          >
            Go home
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;
