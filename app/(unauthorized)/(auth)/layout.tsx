import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import groupOfFriends from "@/public/group_of_friends.webp";
import { LINKS } from "@/lib/constants";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid flex-1 lg:min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-14">
        <Logo className="self-start" />

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-90">{children}</div>
        </main>

        <p className="text-xs text-muted-foreground">
          By continuing you agree to our
          <Link
            href={LINKS.public.terms}
            className="underline underline-offset-2"
          >
            Terms
          </Link>
          and
          <Link
            href={LINKS.public.privacy}
            className="underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <aside className="relative m-3 hidden flex-col justify-end overflow-hidden rounded-[14px] bg-muted p-10 lg:flex">
        <Image
          src={groupOfFriends}
          alt="A group of friends laughing with their arms outstretched"
          fill
          placeholder="blur"
          sizes="50vw"
          className="object-cover object-[center_30%]"
        />
        <figure className="relative max-w-85 rounded-xl border bg-card p-5">
          <blockquote className="text-[15px] leading-normal">
            “I didn&apos;t think my smile changed much. Then I saw a month of
            scores side by side.”
          </blockquote>
          <figcaption className="mt-2.5 text-[13px] text-muted-foreground">
            Average score 81, up 9 in 30 days
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}
