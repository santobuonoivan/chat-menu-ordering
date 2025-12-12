import { fetchCallApi } from "../ApiCallfetchProxy/callApi";

export const ApiCallFindDishesByName = async (payload: any) => {
  return fetchCallApi("/api/agentAI/findDishesByName", payload, "");
};
