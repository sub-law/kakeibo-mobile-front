// src/app/layout.tsx
import "../styles/globals.css";
import { AuthProviderWrapper } from "./providers/AuthProviderWrapper";
import { M_PLUS_Rounded_1c } from "next/font/google";

const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={mPlusRounded.className}>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
