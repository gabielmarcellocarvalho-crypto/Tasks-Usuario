import type { Metadata } from "next";
import { Inter, Roboto, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Inter is the primary UI font; Roboto and (OS-native) Helvetica Neue are
// fallbacks in the --font-sans stack (see globals.css) so text still looks
// intentional if Inter is ever slow to load or blocked.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base — Painel Pessoal",
  description: "Centro de operações pessoal: tarefas, projetos, prazos e Hermes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${roboto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
