// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import ThemeRegistry from "./ThemeRegistry";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.seudominio.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Meu Blog SEO",
    template: "%s | Meu Blog SEO",
  },
  description: "Blog em Next.js com reviews e guias práticos.",
  openGraph: {
    type: "website",
    siteName: "Meu Blog SEO",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* CMP (Consent Management Platform) - precisa vir antes do AdSense */}
        <Script
          id="cmp-loader"
          src="https://SEU_FORNECEDOR_CMP.com/seu-script.js"
          strategy="beforeInteractive"
        />

        {/* AdSense */}
        <Script
          id="adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <ThemeRegistry>{children}</ThemeRegistry>
        <Footer />
      </body>
    </html>
  );
}
