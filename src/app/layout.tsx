import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnonReply — Anonymous Support Platform',
  description: 'An anonymous, moderated support and conversation platform where users can ask for help and discuss specific topics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#1e1e2f] text-slate-100 min-h-screen antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-[#1e1e2f]">
            <Navbar />
            <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
              {children}
            </main>
            <footer className="border-t border-white/[0.08] bg-[#1e1e2f] py-6 text-center text-xs text-slate-400">
              <p>
                AnonReply — Private, confidential support under <span className="text-purple-300 font-semibold">SupportTeam</span>. All conversations auto-delete after 72 hours.
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
