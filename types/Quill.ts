// src/types/Quill.ts
export type QuillOp = {
  insert: string | Record<string, unknown>;
};

export type QuillDelta = {
  ops: QuillOp[];
};
