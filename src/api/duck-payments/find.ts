// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const id = req.body.id;
  //console.log(id);
  let url = `${process.env.URL_API_BACKEND}/api/v1/companies/${id}`;
  let token = process.env.KEY_API_BACKEND as string;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "HTTP-X-API-KEY": token,
      "Content-Type": "application/json",
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
