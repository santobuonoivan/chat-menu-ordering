import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get("signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Signature parameter is required" },
        { status: 400 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/v1/finance/payment/gateway?signature=${signature}`;
    const token = process.env.NEXT_PUBLIC_KEY_API_BACKEND as string;

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
