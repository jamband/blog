export const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};
