// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { CreatePostPayload, Post } from '@/types/Post';
import { addPost, getAllPosts } from '@/lib/posts-store';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreatePostPayload;

  const newPost: Post = {
    id: Date.now().toString(),
    title: body.title,
    slug: body.slug,
    metaDescription: body.metaDescription,
    content: body.content,
    tags: body.tags,
    createdAt: new Date().toISOString(),
    published: true,
  };

  addPost(newPost);

  return NextResponse.json(newPost, { status: 201 });
}

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts);
}
