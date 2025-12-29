import { NextResponse } from "next/server";
import { getServerEnv } from "@/config/env.config";

export async function GET() {
  const { ABLY_API_KEY } = getServerEnv();
  
  if (!ABLY_API_KEY) {
    console.error("❌ ABLY_API_KEY not found in environment variables");
    return NextResponse.json(
      { error: "Ably API key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    apiKey: ABLY_API_KEY,
  });
}
