//src/components/ui/Button.tsx
"use client";

import clsx from "clsx";
import {
  buttonBase,
  buttonSizes,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";

type Props = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  "aria-pressed"?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "default",
  full = true,
  onClick,
  type = "button",
  disabled = false,
  className,
  "aria-pressed": ariaPressed,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      className={clsx(
        buttonBase,
        buttonSizes[size],
        buttonVariants[variant],
        full && "w-full",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
