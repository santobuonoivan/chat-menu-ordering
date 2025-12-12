import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body;

  const url = `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/webhook/16d87d1c-2071-4bf6-b4ee-03873d0cc2ff`;
  console.log("Webhook URL:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const { status } = res;
    const data = await res.json().catch(() => null);
    console.log("Webhook Response Data:", data);
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
