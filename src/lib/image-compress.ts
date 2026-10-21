/**
 * Resize + re-encode an image File in the browser before upload.
 * - Scales so the longest edge is <= maxEdge (never upscales).
 * - Re-encodes as JPEG at the given quality.
 * - On any failure (non-image, decode error, etc.) returns the original file.
 */
export async function compressImage(
  file: File,
  maxEdge = 1000,
  quality = 0.75,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await loadBitmap(file);
    const { width: w, height: h } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, tw, th);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
