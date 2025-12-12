import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const paymentData = req.body;
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
