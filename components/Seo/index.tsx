'use client';

import { NextSeo } from "next-seo";
type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
};

export function Seo({ title, description, canonical }: SeoProps) {
  return (
    <NextSeo
      title={title}
      description={description}
      canonical={canonical}
      openGraph={{
        title,
        description,
        url: canonical,
        siteName: 'Meu Blog SEO',
      }}
    />
  );
}
