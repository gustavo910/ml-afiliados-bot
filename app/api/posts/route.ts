import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  const postsDir = path.join(process.cwd(), 'src/content/posts');

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(postsDir, file.name), buffer);
  }

  return NextResponse.json({ success: true });
}
