import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await params;

  const image = await db.propertyImage.findUnique({
    where: { id: imageId },
    select: {
      url: true,
      content: true,
      mimeType: true,
      filename: true,
      sizeBytes: true,
    },
  });

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  if (!image.content || !image.mimeType) {
    return Response.redirect(new URL(image.url, request.url), 307);
  }

  const bytes = new Uint8Array(image.content);

  return new Response(bytes.buffer, {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": image.sizeBytes ? String(image.sizeBytes) : String(bytes.byteLength),
      "Content-Disposition": `inline; filename="${image.filename ?? `${imageId}.bin`}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
