// src/components/PostDropzobe/index.tsx
"use client";

import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";

type Props = {
  onFilesSelected: (files: File[]) => void;
};

export function PostsDropzone({ onFilesSelected }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "application/json": [".json"],
      "text/markdown": [".md", ".markdown"],
      "text/plain": [".txt"],
    },
    onDrop: (acceptedFiles) => onFilesSelected(acceptedFiles),
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "divider",
        borderRadius: 2,
        p: 4,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      <Typography>
        {isDragActive
          ? "Solte os arquivos aqui..."
          : "Arraste e solte arquivos .json/.md aqui (ou clique para selecionar)"}
      </Typography>
    </Box>
  );
}
