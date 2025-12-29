import { NextResponse } from "next/server";
import { serverEnv } from "../../../../config/env.config";

export async function GET() {
  if (!serverEnv.ABLY_API_KEY) {
    return NextResponse.json(
      { error: "Ably API key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    apiKey: serverEnv.ABLY_API_KEY,
  });
}
