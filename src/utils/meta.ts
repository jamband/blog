export const description = (content: string) => {
  return content
    .slice(0, 180)
    .replace(/#.*|\n|\(.*\)|\[|\]/g, "")
    .slice(0, 90);
};
