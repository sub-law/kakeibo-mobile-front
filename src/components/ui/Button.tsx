//src/components/ui/Button.tsx
"use client";

import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "success"
    | "danger"
    | "secondary"
    | "muted"
    | "navigation";
  size?: "default" | "compact";
  full?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "default",
  full = true,
  onClick,
  type = "button",
  className,
}: Props) {
  const base = "rounded";

  const sizes = {
    default: "py-2",
    compact: "px-3 py-1",
  };

  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    success:
      "bg-green-600 text-white hover:bg-green-700 transition-colors duration-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    muted: "bg-gray-300 hover:bg-gray-400 transition",
    navigation: "bg-gray-200 hover:bg-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        base,
        sizes[size],
        styles[variant],
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}
