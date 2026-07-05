import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/common/Header";
import NavBar from "@/components/common/NavBar";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Discussion forum with saved posts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <div className="app-layout">
            <NavBar />
            <main className="main-content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
