import type { Metadata } from "next";
import "./globals.css";
import { WorkSansRegular } from "./ui-components/typing/fonts";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Secure File Share",
  description: "Secure File Share",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={WorkSansRegular.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
