const BL_API_URL = "https://api.baselinker.com/connector.php";

export async function blRequest<T = unknown>(
  method: string,
  parameters: Record<string, unknown> = {}
): Promise<T> {
  const body = new URLSearchParams({
    token: process.env.BASELINKER_API_KEY!,
    method,
    parameters: JSON.stringify(parameters),
  });

  const res = await fetch(BL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error(`BL HTTP error ${res.status}`);

  const data = await res.json();
  if (data.status !== "SUCCESS") {
    throw new Error(`BL API error: ${data.error_message ?? data.status}`);
  }

  return data as T;
}
