import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexcode - Gerador de Apps Full-Stack com IA",
  description: "Crie seu aplicativo full-stack com banco de dados em minutos usando inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-white">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  );
}
