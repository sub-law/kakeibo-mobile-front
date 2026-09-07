//src/components/ui/ButtonLink.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?:
    | "primary"
    | "success"
    | "info"
    | "danger"
    | "secondary"
    | "dark";
  size?: "default" | "compact";
  full?: boolean;
  className?: string;
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "default",
  full = true,
  className,
}: Props) {
  const base = "rounded text-center font-medium block";

  const sizes = {
    default: "py-2",
    compact: "px-3 py-1",
  };

  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    info: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    dark: "bg-gray-700 text-white hover:bg-gray-800",
  };

  return (
    <Link
      href={href}
      className={clsx(
        base,
        sizes[size],
        styles[variant],
        full && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
