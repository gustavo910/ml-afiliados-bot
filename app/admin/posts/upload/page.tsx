// src/app/(admin)/posts/upload/page.tsx
"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { PostsDropzone } from "@/components/PostDropzobe"; // (confere o nome do arquivo)

export default function UploadPostsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/posts/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Falha no upload");

      router.push("/admin/posts");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>
        Upload de Posts
      </Typography>

      <PostsDropzone onFilesSelected={setFiles} />

      {files.length > 0 && (
<Button
  variant="contained"
  sx={{ mt: 3 }}
  onClick={async () => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const res = await fetch("/api/posts/upload", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      alert("Erro ao salvar arquivos");
      return;
    }

    alert("Salvo!");
    // opcional: ir pra lista
    // router.push("/admin/posts");
  }}
>
  Salvar posts
</Button>

      )}
    </Box>
  );
}
