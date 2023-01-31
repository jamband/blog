export const description = (content: string) => {
  return content
    .slice(0, 180)
    .replace(/#.*|\n/g, "")
    .replace(/\[(.*)?\]\(.*\)/g, "$1")
    .slice(0, 90)
    .trim();
};
