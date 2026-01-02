import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const url = `${process.env.URL_CORE_API}/v2/automate/process_incoming_message`;
    const token = process.env.CORE_API_KEY as string;

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "HTTP-X-API-KEY": token,
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
          // Si es un error del cliente (4xx), no reintentar
          if (status >= 400 && status < 500) {
            return NextResponse.json(
              {
                status,
                error: data?.message || response.statusText || "Unknown error",
              },
              { status }
            );
          }
          // Si es un error del servidor (5xx), guardar y reintentar
          lastError = {
            status,
            error: data?.message || response.statusText || "Unknown error",
          };
        }
      } catch (error: any) {
        lastError = error;
      }

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    if (lastError?.status) {
      return NextResponse.json(
        {
          status: lastError.status,
          error: lastError.error,
        },
        { status: lastError.status }
      );
    } else {
      return NextResponse.json(
        { error: lastError?.message || "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
