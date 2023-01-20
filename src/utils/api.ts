import type { Post } from "@/types/post";
import fg from "fast-glob";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";

const baseDir = join(process.cwd(), "src/posts");
const files = fg.sync(`${baseDir}/**/*.md`);

const contents = (path: string) => {
  return readFileSync(path, "utf8");
};

export const getTags = (): Array<string> => {
  let tags = files.map((path) => {
    const { data } = matter(contents(path));
    return data.tags;
  });
  tags = tags.flat();
  return Array.from(new Set(tags)).sort();
};

export const getPosts = () => {
  const posts = files.map((path) => {
    const { data } = matter(contents(path));
    [data.year, data.month] = data.created_at.split("-");
    data.slug = basename(path).replace(/\.md$/, "");
    return data;
  }) as Array<Post>;

  return posts.sort((post1, post2) => {
    return post1.created_at > post2.created_at ? -1 : 1;
  });
};

export const getLatestPosts = () => {
  return getPosts().slice(0, 3);
};

export const getPostByPath = (path: string) => {
  const { data, content } = matter(contents(`${baseDir}/${path}`));
  return {
    data: data as Post,
    content,
  };
};

export const getPostsByTag = (tag: string) => {
  return getPosts().filter((post) => {
    return post.tags.includes(tag);
  });
};
