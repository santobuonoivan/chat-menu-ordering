import { fetchCallApi } from "../ApiCallfetchProxy/callApi";

export const ApiCallGetPaymentGateway = async (signature: string) => {
  const url = `/api/delivery/getPaymentGateway?signature=${signature}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Response is not ok");
  const data = await response.json();
  return data;
};

export const ApiCallQuoteByRestId = async (payload: any) => {
  return fetchCallApi("/api/delivery/quoteByRestId", payload, "");
};
