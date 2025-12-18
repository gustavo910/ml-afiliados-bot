import { Container, Typography } from "@mui/material";

export default function PrivacyPolicyPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={900} gutterBottom>
        Política de Privacidade
      </Typography>
      <Typography color="text.secondary">
        Escreva aqui sua política (cookies, analytics, anúncios, afiliados etc.).
      </Typography>
    </Container>
  );
}
