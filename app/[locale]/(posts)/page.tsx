"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

type PostCard = {
  id: string;
  slug: string;
  title: string;
  status?: "draft" | "scheduled" | "published";
  publishedAt?: string;
  excerpt?: string;
  cardImageUrl?: string | null;
  cardImageAlt?: string;
};

export default function PostsPage() {
  const params = useParams<{ locale: string }>();
  const country = useMemo(() => (params.locale ?? "de").toLowerCase(), [params.locale]);

  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/posts?country=${country}`);
        const data = (await res.json()) as PostCard[];

        // se você quiser mostrar só publicados:
        // setPosts(data.filter(p => p.status === "published"));

        setPosts(data);
      } catch (e) {
        console.error("Erro ao carregar posts", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [country]);

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Posts ({country.toUpperCase()})</Typography>

        <Button component={Link} href={`/${country}/posts/novo`} variant="contained">
          Novo post
        </Button>
      </Stack>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : posts.length === 0 ? (
        <Typography>Nenhum post cadastrado ainda.</Typography>
      ) : (
        <Stack spacing={2}>
          {posts.map((post) => (
            <Card key={post.id} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Link href={`/${country}/posts/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <CardActionArea
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  {post.cardImageUrl ? (
                    <Box
                      component="img"
                      src={post.cardImageUrl}
                      alt={post.cardImageAlt ?? post.title}
                      loading="lazy"
                      sx={{
                        width: { xs: "100%", sm: 220 },
                        height: { xs: 170, sm: 140 },
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}

                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {post.title}
                    </Typography>

                    {post.publishedAt ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {post.status === "published" ? "Veröffentlicht" : "Geplant"}: {post.publishedAt}
                      </Typography>
                    ) : null}

                    {post.excerpt ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {post.excerpt}
                      </Typography>
                    ) : null}
                  </CardContent>
                </CardActionArea>
              </Link>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
