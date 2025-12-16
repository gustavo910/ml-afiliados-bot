"use client";

import { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [pass, setPass] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // manda a senha via query -> middleware seta cookie e redireciona
    router.push(`/admin${next === "/admin" ? "" : ""}?pass=${encodeURIComponent(pass)}`);
    // melhor: mandar direto para /admin?pass=... e o middleware redireciona p/ /admin
    router.push(`/admin?pass=${encodeURIComponent(pass)}`);
  };

  return (
    <Container sx={{ py: 6, maxWidth: "sm" }}>
      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        <Typography variant="h4">Acesso Admin</Typography>
        <TextField
          label="Senha"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoFocus
        />
        <Button type="submit" variant="contained">
          Entrar
        </Button>
      </Box>
    </Container>
  );
}
