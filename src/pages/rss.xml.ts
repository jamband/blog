import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@/constants/app";
import { posts } from "@/utils/api";
import { description } from "@/utils/meta";
import rss from "@astrojs/rss";

export async function get() {
  return rss({
    title: APP_NAME,
    description: APP_DESCRIPTION,
    site: APP_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.created_at),
      description: description(post.body),
      link: `${import.meta.env.BASE_URL}${post.slug}/`,
    })),
  });
}
