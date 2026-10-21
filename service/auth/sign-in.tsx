"use client";

import { useRouter } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-error";
import { SignInForm } from "@/components/auth/sign-in-form";
import { signIn } from "@/lib/auth-client";
import { useForm } from "@/lib/hooks/use-form";
import { signInSchema } from "@/lib/schemas/auth";
import { LINKS } from "@/lib/constants";

export function SignIn() {
  const router = useRouter();

  const form = useForm(signInSchema, async (values) => {
    const { error } = await signIn.email(values);
    if (error) return authErrorMessage(error);
    router.push(LINKS.protected.dashboard);
    router.refresh();
  });

  return <SignInForm {...form} />;
}
