export const formatDate = (value: string) => {
  return (
    new Date(value)
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace("/", "年")
      .replace("/", "月") + "日"
  );
};
