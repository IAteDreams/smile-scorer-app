import { MailCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown after sign-up while the user verifies their email. */
export function CheckEmail({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border bg-background">
        <MailCheck aria-hidden className="size-6" />
      </div>
      <h1 className="mt-2 font-heading text-[26px] font-semibold tracking-tight">
        Check your email
      </h1>
      <p className="text-sm text-muted-foreground">
        We sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>. Open it to
        finish creating your account.
      </p>
      <Link
        href="/sign-in"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-3 h-9.5 rounded-lg px-4",
        )}
      >
        Back to sign in
      </Link>
    </div>
  );
}
