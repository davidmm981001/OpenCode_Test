import { getBaseURL } from "./utils";

export async function fetchIsAppConfigured(): Promise<boolean> {
  const res = await fetch(`${getBaseURL()}/api/management/config/is_configured`);
  if (!res.ok) {
    throw new Error("Failed to fetch app configuration");
  }
  return res.json();
}
