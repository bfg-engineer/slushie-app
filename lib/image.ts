// Browser-only: shrink a photo before upload so it's fast and fits in the database.
export async function shrinkImage(file: File, maxSide = 1568, quality = 0.85): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  let w: number, h: number, source: CanvasImageSource;
  if (bitmap) {
    w = bitmap.width; h = bitmap.height; source = bitmap;
  } else {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    w = img.naturalWidth; h = img.naturalHeight; source = img;
    URL.revokeObjectURL(url);
  }
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}
