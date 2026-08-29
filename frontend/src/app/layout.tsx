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
    <html lang="en">
      <body className="bg-[#FBF7F4] text-[#3A3450] min-h-screen flex flex-col antialiased selection:bg-[#B8A6E8] selection:text-[#3A3450]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-[#E3DCF0] bg-[#F3EEFB] py-4 text-center text-xs text-[#7A7390]">
          VoiceGuard AI — Real-Time Voice Deepfake Detection & Impersonation Attack Defense Engine
        </footer>
      </body>
    </html>
  );
}
