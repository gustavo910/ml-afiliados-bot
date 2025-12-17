import { Container, Typography } from "@mui/material";
import { Seo } from "@/components/Seo";
import { getAllPosts } from "@/lib/posts";
import { PostsCardsGrid, type PostCardItem } from "@/components/PostsCardsGrid";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function HomePage() {
  const cards: PostCardItem[] = getAllPosts()
    .filter((p) => p.status === "published")
    .map((p) => {
      let excerpt = "";
      let heroImageUrl: string | undefined;

      if (p.raw.trim().startsWith("{")) {
        const data = JSON.parse(p.raw) as {
          content?: string;
          heroImageUrl?: string;
        };

        heroImageUrl = data.heroImageUrl;
        excerpt = stripHtml(data.content ?? "").slice(0, 180);
      } else {
        excerpt = p.raw.slice(0, 180);
      }

      return {
        slug: p.slug,
        title: p.title,
        excerpt: excerpt ? `${excerpt}…` : "",
        heroImageUrl,
      };
    });

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
        <Typography sx={{ mb: 3 }}>
          Aqui vamos publicar artigos otimizados para SEO em vários idiomas.
        </Typography>

        {cards.length === 0 ? (
          <Typography color="text.secondary">Nenhum post publicado ainda.</Typography>
        ) : (
          <PostsCardsGrid posts={cards} />
        )}
      </Container>
    </>
  );
}
