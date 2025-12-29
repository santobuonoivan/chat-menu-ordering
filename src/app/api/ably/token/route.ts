import { NextResponse } from "next/server";

export async function GET() {
  const ablyApiKey = process.env.ABLY_API_KEY;
  console.error("ABLY_API_KEY VALUE:", process.env.ABLY_API_KEY);
  console.error("ablyApiKey VALUE:", ablyApiKey);
  if (!ablyApiKey) {
    console.error("❌ ABLY_API_KEY not found in environment variables");
    return NextResponse.json(
      { error: "Ably API key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    apiKey: ablyApiKey,
  });
}
