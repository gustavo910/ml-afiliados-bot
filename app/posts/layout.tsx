// src/app/posts/layout.tsx
import './post.css';

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
