import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const order = req.body;

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
