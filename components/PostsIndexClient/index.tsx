"use client";

import NextLink from "next/link";
import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Pagination,
  Divider,
} from "@mui/material";

type Post = {
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  cardImageUrl?: string | null;
  heroImageUrl?: string | null;
  cardImageAlt?: string | null;
  heroImageAlt?: string | null;
};

function formatDateDE(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // fallback se vier em formato diferente
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default function PostsIndexClient({
  posts,
  pageSize = 8,
}: {
  posts: Post[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));

  const pagePosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return posts.slice(start, start + pageSize);
  }, [posts, page, pageSize]);

  const handleChange = (_: unknown, value: number) => {
    setPage(value);
    // experiência “europeia”: ao paginar, volta pro topo do conteúdo
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ textAlign: "center", pt: 1 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 34, sm: 44 },
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#111827",
          }}
        >
          Alle Beiträge
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 16, sm: 18 },
            maxWidth: 720,
            mx: "auto",
          }}
        >
          Entdecke unsere aktuellen Ratgeber, Vergleiche und Checklisten.
        </Typography>

        <Divider sx={{ mt: 3 }} />
      </Box>

      {/* Lista */}
      {posts.length === 0 ? (
        <Box sx={{ py: 4 }}>
          <Typography color="text.secondary" textAlign="center">
            Noch keine Beiträge veröffentlicht.
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {pagePosts.map((post) => {
              const img = post.cardImageUrl ?? post.heroImageUrl;
              const alt = post.cardImageAlt ?? post.heroImageAlt ?? post.title;

              return (
                <Card
                  key={post.slug}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                    borderColor: "rgba(17,24,39,0.12)",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 10px 30px rgba(17,24,39,0.08)",
                    },
                  }}
                >
                  <CardActionArea
                    component={NextLink}
                    href={`/${post.slug}`}
                    sx={{
                      display: "flex",
                      alignItems: "stretch",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    {img ? (
                      <Box
                        component="img"
                        src={img}
                        alt={alt}
                        loading="lazy"
                        sx={{
                          width: { xs: "100%", sm: 240 },
                          height: { xs: 190, sm: 160 },
                          objectFit: "cover",
                          flexShrink: 0,
                          borderRight: { sm: "1px solid" },
                          borderColor: { sm: "rgba(17,24,39,0.10)" },
                        }}
                      />
                    ) : null}

                    <CardContent sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.25,
                          letterSpacing: "-0.01em",
                          color: "#0F172A",
                        }}
                      >
                        {post.title}
                      </Typography>

                      {post.publishedAt ? (
                        <Typography
                          sx={{
                            mt: 0.75,
                            color: "text.secondary",
                            fontSize: 13,
                          }}
                        >
                          Veröffentlicht am {formatDateDE(post.publishedAt)}
                        </Typography>
                      ) : null}

                      {post.excerpt ? (
                        <Typography
                          sx={{
                            mt: 1.25,
                            color: "text.secondary",
                            fontSize: 14,
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.excerpt}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Stack>

          {/* Paginação */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 2,
              pb: 1,
            }}
          >
            <Pagination
              count={pageCount}
              page={page}
              onChange={handleChange}
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              showFirstButton
              showLastButton
            />
          </Box>

          {/* Pequeno status (bem comum em sites alemães) */}
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", fontSize: 13 }}
          >
            Seite {page} von {pageCount} • {posts.length} Beiträge insgesamt
          </Typography>
        </>
      )}
    </Stack>
  );
}
