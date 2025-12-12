import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json();
    const recipeUUID = process.env.NEXT_PUBLIC_RECIPE_UUID;

    const url = `${process.env.NEXT_PUBLIC_DUCK_API_URL}/v1/payments/CNKT/order/${recipeUUID}`;
    const token = process.env.NEXT_PUBLIC_TOKEN as string;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentData),
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
