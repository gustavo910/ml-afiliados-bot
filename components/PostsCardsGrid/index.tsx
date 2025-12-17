"use client";

import NextLink from "next/link";

import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";

export type PostCardItem = {
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl?: string;
};

export function PostsCardsGrid({ posts }: { posts: PostCardItem[] }) {
  return (
    <Grid container spacing={2}>
      {posts.map((post) => (
        <Grid key={post.slug} >
          <Card
            variant="outlined"
            sx={{ height: "100%", borderRadius: 3, overflow: "hidden" }}
          >
            <CardActionArea
              component={NextLink}
              href={`/posts/${post.slug}`}
              sx={{ height: "100%", alignItems: "stretch" }}
            >
              {post.heroImageUrl ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={post.heroImageUrl}
                  alt={post.title}
                  sx={{ objectFit: "cover" }}
                />
              ) : null}

              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
