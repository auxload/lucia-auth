"use client";
import {
  InputOTPSlot,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTP,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { resendCodeVerification, verifyEmail } from "../actions/auth.actions";
import { useSession } from "@/contexts/session-provider";
import { redirect, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { ReactNode, useState } from "react";
export const formSchemaCode = z.object({
  code: z.string().min(8, "Enter the code you recived in your email").max(9),
});

export default function VerifyEmail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useSession();
  if (!user || user.emailVerified) {
    redirect("/");
  }

  const form = useForm<z.infer<typeof formSchemaCode>>({
    resolver: zodResolver(formSchemaCode),
    defaultValues: {
      code: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchemaCode>) {
    const res = await verifyEmail(values);
    if (res.success === false) {
      toast({
        variant: "destructive",
        description: res.message,
      });
    } else if (res.success) {
      toast({
        variant: "default",
        description: res.message,
      });
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen   w-full items-center justify-center  px-4 py-12 ">
      <div className="mx-auto w-full max-w-min space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold ">Verify your email</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter the 8-digit code we sent to your email address to verify your
            account.
          </p>
        </div>
        <div className="space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        {...field}
                        maxLength={8}
                        pattern={REGEXP_ONLY_DIGITS}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={5} />
                          <InputOTPSlot index={6} />
                          <InputOTPSlot index={7} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <Button
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await resendCodeVerification();
              setIsLoading(true);
            }}
          >
            <Button
              variant={"secondary"}
              className="w-full"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Code has been sent!" : "Resend Code"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
