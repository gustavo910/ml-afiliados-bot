// src/app/page.tsx
import { Container, Box } from "@mui/material";
import { Seo } from "@/components/Seo";
import { getPublishedPostsDue } from "@/lib/posts";
import PostsIndexClient from "@/components/PostsIndexClient";

export default function HomePage() {
  const posts = getPublishedPostsDue();

  return (
    <>
      <Seo
        title="Alle Beiträge | Ratgeber & Vergleiche"
        description="Aktuelle Ratgeber, Vergleiche und Checklisten für Deutschland – klar, unabhängig und praxisnah."
        canonical="https://www.exemplo.com/"
      />

      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F6F7F9",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
          <PostsIndexClient posts={posts} pageSize={8} />
        </Container>
      </Box>
    </>
  );
}
