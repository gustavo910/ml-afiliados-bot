// src/app/layout.tsx
import type { Metadata } from 'next';
import ThemeRegistry from './ThemeRegistry';

export const metadata: Metadata = {
  title: 'Meu Blog SEO – Next.js + MUI',
  description: 'Blog otimizado para SEO construído com Next.js e Material UI.',
  metadataBase: new URL('https://www.exemplo.com'),
  openGraph: {
    title: 'Meu Blog SEO – Next.js + MUI',
    description: 'Conteúdos otimizados para afiliados e SEO.',
    url: 'https://www.exemplo.com',
    siteName: 'Meu Blog SEO',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
