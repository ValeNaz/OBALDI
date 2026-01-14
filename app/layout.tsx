import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from "../context/UserContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Obaldi",
  description: "Consapevolezza. Tutela. Acquisti sensati."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
