"use client";
import { z } from "zod";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "../app/actions/auth.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OAuthProviders } from "./user-auth-form-sign-in";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpFormSchema } from "@/schemas/auth.schema";
import Link from "next/link";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SignUpForm({ className, ...props }: UserAuthFormProps) {
  const { push } = useRouter();
  // const { toast } = useToast();
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    const res = await signUp(values);

    if (res.success === false) {
      toast({
        variant: "destructive",
        // title: "Sign Up Error",
        description: res.message,
      });
    }
    if (res.success) {
      toast({
        variant: "default",
        // title: "Sign Up Succes ✅",
        description: res.message,
      });
      push("/dashboard");
    }
  }
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            className="w-full "
          >
            Sign Up
          </Button>
        </form>
      </Form>
      <OAuthProviders />
      <span className="text-xs  text-center">
        Allready have an account?{" "}
        <Link href={"/sign-in"} className="text-primary underline">
          Sign In
        </Link>
      </span>
    </div>
  );
}
