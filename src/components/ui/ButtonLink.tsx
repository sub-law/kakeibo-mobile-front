//src/components/ui/ButtonLink.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
};

export default function ButtonLink({
  href,
  children,
  variant = "navigation",
  size = "default",
  full = true,
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        buttonBase,
        "block",
        buttonSizes[size],
        buttonVariants[variant],
        full && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
