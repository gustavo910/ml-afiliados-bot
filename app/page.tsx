// src/app/page.tsx
import { Container, Typography } from '@mui/material';
import { Seo } from '@/components/Seo';

export default function HomePage() {
  return (
    <>
      <Seo
        title="Blog de Afiliados – Início"
        description="Blog em Next.js otimizado para SEO com foco em produtos de afiliados."
        canonical="https://www.exemplo.com/"
      />
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Bem-vindo ao blog
        </Typography>
        <Typography>
          Aqui vamos publicar artigos otimizados para SEO em vários idiomas.
        </Typography>
      </Container>
    </>
  );
}

