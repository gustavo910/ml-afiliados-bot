// src/components/TiptapRenderer.tsx
"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export default function TiptapRenderer({ content }: { content: JSONContent }) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    editable: false,
    content,
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
