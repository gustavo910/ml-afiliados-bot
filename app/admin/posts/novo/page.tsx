// src/app/admin/posts/novo/page.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller, Watch } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Chip,
} from '@mui/material';

import type { JSONContent } from '@tiptap/react';
import { TiptapEditor } from '@/components/admin/TiptapEditor';
import type { CreatePostPayload } from '@/types/Post';

type FormFields = {
  title: string;
  slug: string;
  metaDescription: string;
  tagsInput: string;
};

export default function NovoPostPage() {
  const router = useRouter();

  const [content, setContent] = useState<JSONContent | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      title: '',
      slug: '',
      metaDescription: '',
      tagsInput: '',
    },
  });



  const handleAddTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
  };

  const handleDeleteTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const onSubmit = async (data: FormFields) => {
    if (!content) {
      alert('Preencha o conteúdo do post.');
      return;
    }

    const payload: CreatePostPayload = {
      title: data.title,
      slug: data.slug,
      metaDescription: data.metaDescription,
      content,
      tags,
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar o post');
      }

      alert('Post criado com sucesso!');
      router.push('/admin/posts');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar o post. Tente novamente.');
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <h1>Novo Post (TipTap)</h1>

          {/* Título */}
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Título é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Título"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          {/* Slug */}
          <Controller
            name="slug"
            control={control}
            rules={{ required: 'Slug é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Slug (URL amigável)"
                fullWidth
                error={!!errors.slug}
                helperText={errors.slug?.message}
              />
            )}
          />

          {/* Meta Description */}
          <Controller
            name="metaDescription"
            control={control}
            rules={{
              required: 'Descrição é obrigatória',
              maxLength: { value: 160, message: 'Máx. 160 caracteres' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Meta description"
                fullWidth
                multiline
                minRows={2}
                error={!!errors.metaDescription}
                helperText={errors.metaDescription?.message}
              />
            )}
          />

          {/* Tags simples */}
          <Controller
            name="tagsInput"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label="Tags (pressione Enter para adicionar)"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(field.value);
                      field.onChange('');
                    }
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          />

          {/* Editor de conteúdo */}
          <Box>
            <TiptapEditor value={content} onChange={setContent} />
          </Box>

          {/* Botões */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => router.push('/admin/posts')}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Salvar / Publicar
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
