import type { Metadata } from "next";
import { SignIn } from "@/service/auth/sign-in";

export const metadata: Metadata = {
  title: "Sign in · Smilescore",
};

export default function SignInPage() {
  return <SignIn />;
}
