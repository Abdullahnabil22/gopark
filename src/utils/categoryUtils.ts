import { type Category } from "../services/api";

/**
 * Get category name by ID from categories array
 * @param categoryId - The category ID to look up
 * @param categories - Array of categories
 * @returns The category name or the ID if not found
 */
export function getCategoryName(
  categoryId: string,
  categories?: Category[]
): string {
  return categories?.find((c) => c.id === categoryId)?.name || categoryId;
}

/**
 * Get category color class based on category name
 * @param category - The category name
 * @returns CSS class string for the category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    premium: "bg-purple-100 text-purple-800",
    standard: "bg-blue-100 text-blue-800",
    economy: "bg-green-100 text-green-800",
    vip: "bg-yellow-100 text-yellow-800",
  };
  return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
}
