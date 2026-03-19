import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chewit — Learn anything, faster",
  description: "Transform any content into interactive flashcards and quizzes powered by AI",
};

const isMissingApiKey =
  !process.env.ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY === "sk-ant-your-key-here";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Header />
          {isMissingApiKey && process.env.NODE_ENV === "development" && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
              ⚠️ <strong>ANTHROPIC_API_KEY</strong> is not set. Add it to{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>{" "}
              or set <code className="font-mono bg-amber-100 px-1 rounded">USE_MOCK_DATA=true</code>.
            </div>
          )}
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
