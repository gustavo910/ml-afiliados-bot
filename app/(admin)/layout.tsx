// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meu Blog SEO',
  description: 'Blog em Next.js + TipTap',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
