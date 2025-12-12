import { fetchCallApi } from "../ApiCallfetchProxy/callApi";

export const ApiCallProcessIncomingMessage = async (payload: any) => {
  return fetchCallApi("/api/core/processIncomingMessage", payload, "");
};
