export const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};
