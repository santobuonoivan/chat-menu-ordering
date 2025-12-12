import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const order = await request.json();

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/automate/core/orders`;
    const token = process.env.NEXT_PUBLIC_API_KEY as string;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Authorization": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(order),
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
