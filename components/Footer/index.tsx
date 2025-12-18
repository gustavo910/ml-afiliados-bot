"use client";

import Link from "next/link";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";

const links = [
  { href: "/privacy-policy", label: "Política de Privacidade" },
  { href: "/terms", label: "Termos" },
  { href: "/about", label: "Sobre" },
  { href: "/contact", label: "Contato" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ mt: 6, bgcolor: "background.paper" }}>
      <Divider />
      <Container sx={{ py: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Meu Blog SEO. Todos os direitos reservados.
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            {links.map((l) => (
              <Typography
                key={l.href}
                component={Link}
                href={l.href}
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {l.label}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
