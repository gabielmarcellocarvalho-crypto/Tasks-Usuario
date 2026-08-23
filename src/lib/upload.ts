const MAX_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

/**
 * Converts an uploaded image to a data: URI stored directly on the record.
 * There's no external object storage in this setup, and Vercel's
 * filesystem is read-only at runtime — a personal app's preview images are
 * small enough that storing them inline in Postgres is simpler than wiring
 * up a separate storage service, and it means deleting the record cleans
 * up the image automatically (no orphaned files to ever worry about).
 */
export async function imageToDataUrl(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato de imagem não suportado.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem maior que 4MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}
