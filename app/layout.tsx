// app/layout.tsx
import type { Metadata } from "next";
import ThemeRegistry from "./ThemeRegistry";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Meu Blog SEO",
  description: "Blog em Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
            <head>
        {/* Script da CMP (vem do fornecedor) */}
        <Script
          id="cmp-loader"
          src="https://SEU_FORNECEDOR_CMP.com/seu-script.js"
          strategy="beforeInteractive"
        />

        {/* AdSense (pode ficar aqui também) */}
        <Script
          id="adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
