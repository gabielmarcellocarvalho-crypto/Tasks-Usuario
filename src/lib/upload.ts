import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

/**
 * Saves an uploaded image under public/uploads/<folder>/ and returns the
 * public path to store on the record. Runs on the server only — writes
 * straight to disk since there's no external object storage in this setup.
 */
export async function savePreviewImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato de imagem não suportado.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem maior que 4MB.");
  }

  const ext = file.type.split("/")[1].replace("svg+xml", "svg");
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${folder}/${filename}`;
}
