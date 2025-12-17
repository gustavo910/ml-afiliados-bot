import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { normalizeCountry } from "@/lib/countries";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { actionPublishNext, actionScheduleDrafts } from "./posts/actions";



function StatusChip({ status }: { status: "draft" | "scheduled" | "published" }) {
  if (status === "published") return <Chip label="Publicado" color="success" size="small" />;
  if (status === "scheduled") return <Chip label="Agendado" color="warning" size="small" />;
  return <Chip label="Rascunho" variant="outlined" size="small" />;
}

export default function AdminPostsPage({ params }: { params: { locale: string } }) {
  const country = normalizeCountry(params.locale);
  const posts = getAllPosts(country);

  const queue = posts
    .filter((p) => p.status === "scheduled" && p.publishedAt)
    .sort((a, b) => (a.publishedAt ?? "").localeCompare(b.publishedAt ?? ""));
  const queueIndex = new Map(queue.map((p, i) => [p.slug, i + 1]));

  const total = posts.length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;
  const published = posts.filter((p) => p.status === "published").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Posts ({country.toUpperCase()})
          </Typography>

          <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
            <Chip label={`Total: ${total}`} size="small" />
            <Chip label={`Rascunhos: ${drafts}`} size="small" variant="outlined" />
            <Chip label={`Agendados: ${scheduled}`} size="small" color="warning" variant="outlined" />
            <Chip label={`Publicados: ${published}`} size="small" color="success" variant="outlined" />
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems={{ sm: "center" }}>
          {/* ✅ link com país */}
          <Link href={`/${country}/admin/posts/upload`} style={{ textDecoration: "none" }}>
            <Button variant="contained">Upload de posts</Button>
          </Link>

          {/* ✅ action recebe country */}
          <form action={actionPublishNext}>
            <input type="hidden" name="country" value={country} />
            <Button type="submit" variant="outlined">
              Publicar próximo da fila
            </Button>
          </form>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Typography fontWeight={700} mb={1}>
          Fila de publicação (1 por dia)
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems={{ sm: "center" }}>
          <form action={actionScheduleDrafts} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="hidden" name="country" value={country} />

            <TextField
              name="startDate"
              label="Data inicial"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              helperText="Se vazio, começa amanhã"
            />

            <Button type="submit" variant="contained">
              Agendar rascunhos (1/dia)
            </Button>
          </form>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Isso grava <b>status</b> e <b>publishedAt</b> nos arquivos JSON em{" "}
            <code>content/{country}/posts</code>.
          </Typography>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Fila</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Slug</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Publicação</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {posts.map((post) => (
              <TableRow
                key={post.slug}
                hover
                sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}
              >
                <TableCell sx={{ width: 70 }}>{queueIndex.get(post.slug) ?? "-"}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{post.title}</TableCell>
                <TableCell sx={{ fontFamily: "monospace" }}>{post.slug}</TableCell>
                <TableCell>
                  <StatusChip status={post.status} />
                </TableCell>
                <TableCell>{post.publishedAt ?? "-"}</TableCell>
              </TableRow>
            ))}

            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                  Nenhum post encontrado em <code>content/{country}/posts</code>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
