"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { signOut } from "@/lib/auth-client";
import { LINKS } from "@/lib/constants/links";

type UserMenuProps = {
  name: string;
  email: string;
};

export function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSignOut = () =>
    startTransition(async () => {
      await signOut();
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
