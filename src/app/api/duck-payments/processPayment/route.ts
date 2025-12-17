import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json();
    const cart_id = paymentData.cart_id;
    const payload = paymentData.payload;

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/automate/core/pay/${cart_id}`;
    const token = process.env.NEXT_PUBLIC_API_KEY as string;

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
    console.log("Payment Response url:", url);
    console.log("Payment Response token:", token);
    console.log("Payment Response Status:", status);
    const data = await response.json().catch(() => null);
    console.log("Payment Response Payload:", data);

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
