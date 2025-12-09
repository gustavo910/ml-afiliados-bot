// src/lib/posts-store.ts
import type { Post } from '@/types/Post';

const posts: Post[] = [];

export function addPost(post: Post) {
  posts.push(post);
}

export function getAllPosts(): Post[] {
  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  return posts.find((p) => p.slug === slug) ?? null;
}
