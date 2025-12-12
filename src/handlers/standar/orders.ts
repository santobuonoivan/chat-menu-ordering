import { fetchCallApi } from "../ApiCallfetchProxy/callApi";

export const ApiCallGetMenu = async (phone: string) => {
  const url = `/api/standar/getMenu?phone=${phone}`;
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

export const ApiCallSendOrder = async (payload: any) => {
  return fetchCallApi("/api/standar/sendOrder", payload, "");
};
