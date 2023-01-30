import { getCollection } from "astro:content";

export const posts = await getCollection("posts");

export const getTags = () => {
  const tags = posts.map(({ data }) => data.tags).flat();
  return Array.from(new Set(tags)).sort();
};

export const getPosts = () => {
  return posts.sort((post1, post2) => {
    return post1.data.created_at > post2.data.created_at ? -1 : 1;
  });
};

export const getLatestPosts = () => {
  return getPosts().slice(0, 3);
};

export const getPostsByTag = (tag?: string) => {
  return getPosts().filter(({ data }) => {
    return data.tags.includes(tag || "");
  });
};
