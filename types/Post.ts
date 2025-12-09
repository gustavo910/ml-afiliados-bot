// src/types/post.ts
import type { JSONContent } from '@tiptap/react';

export type PostContent = JSONContent;

export type Post = {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  content: PostContent;
  createdAt: string;
  published: boolean;
  tags: string[];
};

// payload que o admin envia pra API
export type CreatePostPayload = {
  title: string;
  slug: string;
  metaDescription: string;
  content: PostContent;
  tags: string[];
};
