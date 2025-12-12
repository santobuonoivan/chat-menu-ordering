import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const { signature } = req.query;

  const url = `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/v1/finance/payment/gateway?signature=${signature}`;
  const token = process.env.NEXT_PUBLIC_KEY_API_BACKEND as string;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Authorization": token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
