import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let payload = await request.json();
    console.log("Received payload:", payload);

    const url = `${process.env.URL_API_BACKEND}/v2/delivery/booking/quote-by-rest-id`;
    const token = process.env.KEY_API_BACKEND as string;

    console.log("Backend URL:", url);
    console.log("Token exists:", !!token);

    /*payload = {
      rest_id: 163,
      lat: 19.432608,
      lng: -99.133209,
    };*/
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
    console.error("Error in quoteByRestId:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
