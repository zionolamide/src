
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const formSchema = z.object({
  password: z
    .string()
    .refine((val) => val === "password123", {
      message: "Invalid password.",
    }),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // On successful validation, store a default username and redirect.
    localStorage.setItem("username", "Analyst");
    const fromPath = searchParams.get('from') || '/dashboard/overview';
    router.push(fromPath);
  };

  React.useEffect(() => {
    // If user is already "logged in", redirect to dashboard
    if (localStorage.getItem("username")) {
      const fromPath = searchParams.get('from') || '/dashboard/overview';
      router.push(fromPath);
    }
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Icons.logo className="w-12 h-12 text-primary" />
          </div>
          <CardTitle>Fraud Sentinel</CardTitle>
          <CardDescription>
            Enter the password to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={methods.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </main>
  );
}
