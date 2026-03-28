import { getBaseURL } from "./utils";

export async function fetchIsAppConfigured() {
  const res = await fetch(`${getBaseURL()}/api/chat/config/models`);
  if (!res.ok) {
    throw new Error("Failed to fetch app configuration");
  }
  return true;
}
