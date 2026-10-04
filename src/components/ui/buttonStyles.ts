export type ButtonVariant =
  | "primary"
  | "navigation"
  | "secondary"
  | "danger";

export type ButtonSize = "default" | "compact";

export const buttonBase =
  "rounded-lg text-center font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const buttonSizes: Record<ButtonSize, string> = {
  default: "py-2",
  compact: "px-3 py-1",
};

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  navigation:
    "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};
