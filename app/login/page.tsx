"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = useMemo(() => sp.get("next") ?? "/admin/posts", [sp]);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Falha no login");
      }

      // cookie já foi setado pela API (httpOnly)
      router.replace(next);
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 8, maxWidth: "sm" }}>
      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Área Administrativa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entre com seu login e senha para continuar.
              </Typography>
            </Box>

            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

            <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
              <TextField
                label="Login"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <TextField
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
