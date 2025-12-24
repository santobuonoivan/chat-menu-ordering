import { fetchCallApi } from "../ApiCallfetchProxy/callApi";

export const ApiCallAgentWorkflow = async (payload: any) => {
  return fetchCallApi("/api/agentAI/findDishesByName", payload, "");
};
