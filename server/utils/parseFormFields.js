exports.parseJsonArrayField = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return value.trim() ? [value] : fallback;
    }
  }
  return fallback;
};
