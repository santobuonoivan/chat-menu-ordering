import { NextRequest, NextResponse } from "next/server";
import { EventBatch } from "@/types/tracking";

export async function POST(request: NextRequest) {
  try {
    const batch: EventBatch = await request.json();

    // Validación básica
    if (!batch.batchId || !batch.events || !Array.isArray(batch.events)) {
      return NextResponse.json(
        { error: "Invalid batch format" },
        { status: 400 }
      );
    }

    // TODO: Aquí enviarías los eventos a tu backend de analytics
    // Por ahora solo logueamos en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Tracking API] Received batch ${batch.batchId} with ${batch.count} events`
      );
      console.log("Events:", JSON.stringify(batch.events, null, 2));
    }

    // Simular envío exitoso
    // En producción, aquí llamarías a tu servicio de analytics:
    const url = `${process.env.BACKEND_URL}/automate/core/tracking/batch`;
    const token = process.env.API_KEY as string;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error("Failed to send to analytics service");
    }

    return NextResponse.json({
      success: true,
      batchId: batch.batchId,
      processedEvents: batch.count,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("[Tracking API] Error processing batch:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}
