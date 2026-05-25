/**
 * Converts a category name to a URL-safe single-segment slug.
 * e.g. "AI/ML" -> "ai-ml", "Web Development" -> "web-development"
 */
export const categoryNameToSlug = (name = "") => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

/** Match category by slug from URL (supports legacy paths like ai/ml) */
export const matchesCategorySlug = (categoryName, urlSlug = "") => {
  const normalizedUrlSlug = categoryNameToSlug(
    urlSlug.replace(/\//g, "-")
  );
  return categoryNameToSlug(categoryName) === normalizedUrlSlug;
};

export const getCatalogPath = (categoryName) =>
  `/catalog/${categoryNameToSlug(categoryName)}`;
