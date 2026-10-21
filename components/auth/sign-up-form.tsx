import { LoaderCircle, Mail, User } from "lucide-react";
import Link from "next/link";
import type { z } from "zod";
import { FormAlert, FormField } from "@/components/common/form";
import { IconInput, PasswordInput } from "@/components/common/input";
import { Button } from "@/components/ui/button";
import type { signUpSchema } from "@/lib/schemas/auth";
import type { FormState } from "@/types/form";

type SignUpFormProps = FormState<z.infer<typeof signUpSchema>>;

export function SignUpForm({
  onSubmit,
  pending,
  errors,
  formError,
}: SignUpFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-[28px] font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Score your smiles and track them over time.
        </p>
      </div>

      {formError && <FormAlert message={formError} />}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="name" label="Name" error={errors.name?.[0]}>
          <IconInput
            id="name"
            name="name"
            icon={User}
            autoComplete="name"
            placeholder="Maria Reyes"
            aria-invalid={!!errors.name || undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </FormField>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
