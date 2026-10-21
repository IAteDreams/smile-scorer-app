import { LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import type { z } from "zod";
import { FormAlert, FormField } from "@/components/common/form";
import { IconInput, PasswordInput } from "@/components/common/input";
import { Button } from "@/components/ui/button";
import type { signInSchema } from "@/lib/schemas/auth";
import type { FormState } from "@/types/form";
import { LINKS } from "@/lib/constants/links";

type SignInFormProps = FormState<z.infer<typeof signInSchema>>;

export function SignInForm({
  onSubmit,
  pending,
  errors,
  formError,
}: SignInFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-[28px] font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to see your smile history.
        </p>
      </div>

      {formError && <FormAlert message={formError} />}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="email" label="Email" error={errors.email?.[0]}>
          <IconInput
            id="email"
            name="email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="maria@example.com"
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.[0]}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password || undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </FormField>

        <Button
          type="submit"
          disabled={pending}
          className="h-10 w-full rounded-lg"
        >
          {pending && <LoaderCircle className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={LINKS.guest.signUp}
          className="text-foreground underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
