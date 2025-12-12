'use client';

import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { PostsDropzone } from '@/components/PostDropzobe';


export default function UploadPostsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!files.length) return;

    setLoading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));

      const res = await fetch('/api/posts/upload', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error('Falha no upload');

      setFiles([]);
      // Atualiza as páginas server que listam posts
      router.refresh();
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={900}>
          Upload de Posts
        </Typography>

        <PostsDropzone value={files} onChange={setFiles} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => setFiles([])} disabled={!files.length || loading}>
            Limpar
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={!files.length || loading}>
            {loading ? 'Salvando...' : 'Salvar posts'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
