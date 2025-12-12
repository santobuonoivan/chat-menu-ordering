import { fetchCallApi } from "../ApiCallfetchProxy/callApi";

export const ApiCallProcessPayment = async (payload: any) => {
  return fetchCallApi("/api/duck-payments/processPayment", payload, "");
};
