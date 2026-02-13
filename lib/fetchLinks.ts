import type { LinkCategory } from "@/data/links";

export async function fetchLinksFromGoogle(): Promise<LinkCategory[]> {
  try {
    const response = await fetch("/api/links");
    if (!response.ok) {
      throw new Error("Failed to fetch links");
    }
    const data = await response.json();
    return data.linkCategories || [];
  } catch (error) {
    console.error("Error fetching links:", error);
    return [];
  }
}
