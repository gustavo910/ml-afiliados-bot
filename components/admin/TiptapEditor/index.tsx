// src/components/admin/TiptapEditor.tsx
'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

import {
  Box,
  IconButton,
  Stack,
  ButtonGroup,
  Divider,
} from '@mui/material';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';

export type TiptapEditorProps = {
  value: JSONContent | null;
  onChange: (content: JSONContent) => void;
};

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      Image,
    ],
    content:
      value ??
      ({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
          },
        ],
      } satisfies JSONContent),
    autofocus: 'end',
    immediatelyRender: false, // crucial pra não dar erro de SSR no Next
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('URL do link:');
    if (!url) return;

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '& .ProseMirror': {
          minHeight: 240,
          padding: 2,
          outline: 'none',
        },
      }}
    >
      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1,
          py: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <ButtonGroup size="small">
          <IconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive('bold') ? 'primary' : 'default'}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive('italic') ? 'primary' : 'default'}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <IconButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
          >
            <TitleIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <IconButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive('bulletList') ? 'primary' : 'default'}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive('orderedList') ? 'primary' : 'default'}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ButtonGroup size="small">
          <IconButton onClick={setLink}>
            <InsertLinkIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={addImage}>
            <ImageIcon fontSize="small" />
          </IconButton>
        </ButtonGroup>
      </Stack>

      {/* Editor */}
      <EditorContent editor={editor} />
    </Box>
  );
}
