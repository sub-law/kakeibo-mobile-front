// src/app/layout.tsx
import "../styles/globals.css";
import { AuthProviderWrapper } from "./providers/AuthProviderWrapper";
import { RocknRoll_One } from "next/font/google";

const rocknRoll = RocknRoll_One({
  subsets: ["latin"],
  weight: ["400"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={rocknRoll.className}>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
