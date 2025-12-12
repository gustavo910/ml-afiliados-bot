// app/layout.tsx
import type { Metadata } from "next";
import ThemeRegistry from "./ThemeRegistry";

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
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
