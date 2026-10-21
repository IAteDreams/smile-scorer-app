"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import {
  IconInput,
  type IconInputProps,
} from "@/components/common/input/icon-input";

type PasswordInputProps = Omit<IconInputProps, "type" | "icon" | "trailing"> & {
  icon?: IconInputProps["icon"];
};

export function PasswordInput({ icon = Lock, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <IconInput
      type={visible ? "text" : "password"}
      icon={icon}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  );
}
