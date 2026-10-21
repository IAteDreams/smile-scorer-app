"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { signOut } from "@/lib/auth-client";
import { LINKS } from "@/lib/constants/links";
import { ERRORS } from "@/lib/error";

type UserMenuProps = {
  name: string;
  email: string;
};

export function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSignOut = () =>
    startTransition(async () => {
      const { error } = await signOut();
      if (error) {
        toast.error(ERRORS.auth.signOutFailed);
        return;
      }
      router.push(LINKS.guest.signIn);
      router.refresh();
    });

  return (
    <AccountMenu
      name={name}
      email={email}
      pending={pending}
      onSignOut={handleSignOut}
    />
  );
}
