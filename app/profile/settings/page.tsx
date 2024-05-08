"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useSession } from "@/contexts/session-provider";
import {
  deleteAccount,
  resetPassword,
  updatePersonalInfo,
} from "@/app/actions/auth.actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const personalInfoformSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});
const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(50, { message: "Password must be at most 50 characters long" });

export const resetPasswordFormSchema = z
  .object({
    currentPassword: PasswordSchema,
    newPassword: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  });

export default function Page() {
  const { user } = useSession();
  const { push, refresh } = useRouter();
  if (!user) {
    push("/sign-in");
  }
  // 1. Define your form.
  const personalInfoForm = useForm<z.infer<typeof personalInfoformSchema>>({
    resolver: zodResolver(personalInfoformSchema),
    defaultValues: {
      username: user?.username,
      email: user?.email,
    },
  });
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  // 2. Define a submit handler.
  async function personalInfoOnSubmit(
    values: z.infer<typeof personalInfoformSchema>
  ) {
    const res = await updatePersonalInfo(values.username);
    if (res.success === false) {
      toast({
        variant: "destructive",
        description: res.message,
      });
    }
    if (res.success) {
      toast({
        variant: "default",
        description: res.message,
      });
      refresh();
    }

    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  async function resetPasswordOnSubmit(
    values: z.infer<typeof resetPasswordFormSchema>
  ) {
    const res = await resetPassword(values);
    if (res.success === false) {
      toast({
        variant: "destructive",
        description: res.message,
      });
    }
    if (res.success) {
      toast({
        variant: "default",
        description: res.message,
      });
      // refresh();
    }

    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    console.log(values);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen  p-4">
      <div className="max-w-3xl w-full   rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <Form {...personalInfoForm}>
            <form
              onSubmit={personalInfoForm.handleSubmit(personalInfoOnSubmit)}
              className="gap-6 grid md:grid-cols-2 "
            >
              <FormField
                control={personalInfoForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder={"Username"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled placeholder={"Email"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={
                  personalInfoForm.formState.isSubmitting ||
                  personalInfoForm.formState.isSubmitted
                }
                className="w-max"
                type="submit"
              >
                {personalInfoForm.formState.isSubmitting ||
                personalInfoForm.formState.isSubmitted
                  ? "Saved"
                  : "Save"}
              </Button>
            </form>
          </Form>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Password</h2>
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit(resetPasswordOnSubmit)}
              className="gap-6 grid md:grid-cols-2 "
            >
              <FormField
                control={resetPasswordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={
                  resetPasswordForm.formState.isSubmitting
                  // resetPasswordForm.formState.isSubmitted
                }
                className="w-max md:col-span-2"
                type="submit"
              >
                {resetPasswordForm.formState.isSubmitting
                  ? // resetPasswordForm.formState.isSubmitted
                    "Saved"
                  : "Change Password"}
              </Button>
            </form>
          </Form>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="space-y-2">
            <p className="text-gray-500 dark:text-gray-400">
              Deleting your account is a permanent action and cannot be undone.
              All your data will be permanently deleted.
            </p>
            <AlertDialog>
              <AlertDialogTrigger>
                <div className={cn(buttonVariants({ variant: "destructive" }))}>
                  Delete Account
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form action={deleteAccount}>
                    <Button
                      type="submit"
                      className="w-full"
                      variant={"destructive"}
                    >
                      Delete Account
                    </Button>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </main>
  );
}
