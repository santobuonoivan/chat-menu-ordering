import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received request to process incoming message");
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body;

  const url = `${process.env.NEXT_PUBLIC_URL_CORE_API}/v2/automate/process_incoming_message`;
  const token = process.env.NEXT_PUBLIC_CORE_API_KEY as string;

  console.log("Processing incoming message with payload:", payload);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "HTTP-X-API-KEY": token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const { status } = res;
    const data = await res.json().catch(() => null);
    if (res.ok) {
      return { status, data };
    } else {
      return {
        status,
        error: data?.message || res.statusText || "Unknown error",
      };
    }
  });

  res.status(200).json(response);
}
