export const fetchCallApi = async (
  url: any,
  payload: any = {},
  token: string | null = ""
) => {
  let headers: any = { "Content-Type": "application/json" };

  if (token && token != "") headers["Authorization"] = `${token}`;

  const response = await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log("API Call Response:", response);
  if (!response.ok) throw new Error("Response is not ok");
  const data = await response.json();

  return data;
};
