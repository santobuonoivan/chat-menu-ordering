import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const payload = req.body;

  const url = `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/v2/delivery/booking/quote-by-rest-id`;
  const token = process.env.NEXT_PUBLIC_KEY_API_BACKEND as string;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Authorization": token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      const { status } = res;
      const data = await res.json().catch(() => null);
      console.log("Quote By Rest ID Response Data:", data);
      if (res.ok) {
        return { status, data };
      } else {
        return {
          status,
          error: data?.message || res.statusText || "Unknown error",
        };
      }
    })
    .catch((error) => {
      console.error("Fetch error in Quote By Rest ID:", error);
      return {
        status: 500,
        error: "Internal Server Error",
      };
    });

  res.status(200).json(response);
}
