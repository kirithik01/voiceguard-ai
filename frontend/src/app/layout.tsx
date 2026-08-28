import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VoiceGuard AI — Real-Time Voice Cloning Impersonation Attack Prevention",
  description: "Enterprise cyber-defense platform powered by Wav2Vec2 & acoustic forensic modeling to detect and neutralize synthetic voice cloning in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-[#060910] py-4 text-center text-xs text-slate-500">
          VoiceGuard AI — Real-Time Voice Deepfake Detection & Impersonation Attack Defense Engine
        </footer>
      </body>
    </html>
  );
}
