// app/admin/posts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import type { Post } from '@/types/Post';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/posts');
        const data = (await res.json()) as Post[];
        setPosts(data);
      } catch (e) {
        console.error('Erro ao carregar posts', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4">Posts</Typography>

        <Button component={Link} href="/admin/posts/novo" variant="contained">
          Novo post
        </Button>
      </Stack>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : posts.length === 0 ? (
        <Typography>Nenhum post cadastrado ainda.</Typography>
      ) : (
        <List>
          {posts.map((post) => (
            <ListItem key={post.id} disableGutters>
              <ListItemText
                primary={post.title}
                secondary={`/posts/${post.slug}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
