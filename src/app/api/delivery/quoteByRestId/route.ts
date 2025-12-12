import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const url = `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/v2/delivery/booking/quote-by-rest-id`;
    const token = process.env.NEXT_PUBLIC_KEY_API_BACKEND as string;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Authorization": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const { status } = response;
    const data = await response.json().catch(() => null);

    if (response.ok) {
      return NextResponse.json({ status, data });
    } else {
      return NextResponse.json(
        {
          status,
          error: data?.message || response.statusText || "Unknown error",
        },
        { status }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
