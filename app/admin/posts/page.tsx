// src/app/(admin)/posts/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Stack, Typography
} from "@mui/material";

export default function AdminPostsPage() {
  const posts = getAllPosts();

  return (
    <>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3 }}>
        <Typography variant="h4">Posts</Typography>

        <Link href="/admin/posts/upload" style={{ textDecoration: "none" }}>
          <Button variant="contained">Upload de posts</Button>
        </Link>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Título</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Publicação</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.slug}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.slug}</TableCell>
              <TableCell>{post.status}</TableCell>
              <TableCell>{post.publishedAt ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
