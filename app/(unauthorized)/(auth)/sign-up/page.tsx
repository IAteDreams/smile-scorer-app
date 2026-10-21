import type { Metadata } from "next";
import { SignUp } from "@/service/auth/sign-up";

export const metadata: Metadata = {
  title: "Create account · Smilescore",
};

export default function SignUpPage() {
  return <SignUp />;
}
