import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone parameter is required" },
        { status: 400 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/automate/core/menu/${phone}`;
    const token = process.env.NEXT_PUBLIC_API_KEY as string;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Authorization": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
