'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

type Props = {
  value: File[];
  onChange: (files: File[]) => void;
};

function prettySize(bytes: number) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function PostsDropzone({ value, onChange }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // junta sem duplicar (mesmo nome+size)
      const next = [...value];
      for (const f of acceptedFiles) {
        const exists = next.some((x) => x.name === f.name && x.size === f.size);
        if (!exists) next.push(f);
      }
      onChange(next);
    },
    [value, onChange],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      multiple: true,
      accept: {
        'application/json': ['.json'],
        'text/markdown': ['.md', '.markdown'],
        'text/plain': ['.md'],
      },
      maxSize: 5 * 1024 * 1024, // 5MB
    });

  const removeFile = (name: string, size: number) => {
    onChange(value.filter((f) => !(f.name === name && f.size === size)));
  };

  return (
    <Stack spacing={2}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
          transition: '0.15s',
        }}
      >
        <input {...getInputProps()} />

        <Stack spacing={0.5} alignItems="center">
          <Typography fontWeight={700}>
            {isDragActive
              ? 'Solte aqui...'
              : 'Arraste e solte arquivos .json/.md aqui (ou clique para selecionar)'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Você pode enviar vários de uma vez
          </Typography>
        </Stack>
      </Box>

      {!!fileRejections.length && (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}>
          <Typography color="error" fontWeight={700}>
            Alguns arquivos foram rejeitados:
          </Typography>
          {fileRejections.map((rej) => (
            <Typography key={rej.file.name} variant="body2" color="error">
              {rej.file.name} — {rej.errors.map((e) => e.message).join(', ')}
            </Typography>
          ))}
        </Box>
      )}

      {value.length > 0 && (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={800}>Arquivos selecionados</Typography>
              <Chip label={`${value.length}`} />
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={1} sx={{ p: 2 }}>
            {value.map((f) => (
              <Stack
                key={`${f.name}-${f.size}`}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                }}
              >
                <Box>
                  <Typography fontWeight={700}>{f.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prettySize(f.size)}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => removeFile(f.name, f.size)}
                  size="small"
                  aria-label={`Remover ${f.name}`}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
