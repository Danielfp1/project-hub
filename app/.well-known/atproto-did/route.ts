import { NextResponse } from "next/server";

export async function GET() {
  const did = "did:plc:hm5nb5gefrcikhhbddqbigvv";

  return new NextResponse(did, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
