import type { Metadata } from "next";
import "./globals.css";
import { WorkSansRegular } from "./ui-components/typing/fonts";
import { Providers } from './providers'

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
        <Providers>
          {children}
        </Providers>
        <div id="portal-root" className="inactive" />
      </body>
    </html>
  );
}
