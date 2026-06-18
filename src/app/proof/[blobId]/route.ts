import { NextRequest, NextResponse } from "next/server";
import { fetchBlob } from "@/lib/walrus";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blobId: string }> },
) {
  let blobId = "";
  try {
    blobId = (await params).blobId;

    if (!blobId) {
      return NextResponse.json({ success: false, error: "Missing blobId" }, { status: 400 });
    }

    const html = await fetchBlob(blobId);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`[GET /proof/${blobId}]`, error);
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Proof Not Found</title>
<style>
body { font-family: system-ui, sans-serif; background: #F7F5F0; color: #1A1A2E; display: grid; place-items: center; min-height: 100vh; margin: 0; }
div { text-align: center; border: 1px solid #DDD8CE; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
h1 { margin: 0 0 10px; font-size: 24px; color: #3B6FD4; }
p { margin: 0; color: #6B6B85; }
</style>
</head>
<body>
<div>
  <h1>Proof Not Found</h1>
  <p>The requested Walrus proof blob could not be fetched. It might still be propagating.</p>
</div>
</body>
</html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }
}
