"use client";

import { useState } from "react";
import { CheckEmail } from "@/components/auth/check-email";
import { authErrorMessage } from "@/lib/auth-error";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { signUp } from "@/lib/auth-client";
import { useForm } from "@/lib/hooks/use-form";
import { signUpSchema } from "@/lib/schemas/auth";
import { LINKS } from "@/lib/constants/links";

export function SignUp() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm(signUpSchema, async (values) => {
    const { error } = await signUp.email({
      ...values,
      callbackURL: LINKS.protected.dashboard,
    });
    if (error) return authErrorMessage(error);
    setSentTo(values.email);
  });

  if (sentTo) return <CheckEmail email={sentTo} />;

  return <SignUpForm {...form} />;
}
