import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  for (const file of files) {
    const name = file.name.toLowerCase();

    // deixa só md/json
    if (!name.endsWith(".md") && !name.endsWith(".json")) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(POSTS_DIR, file.name), buffer);
  }

  return NextResponse.json({ success: true });
}
