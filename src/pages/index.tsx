import { GetStaticProps } from "next";
import Link from "next/link";
import { Tags } from "~/components/tags";
import { Page } from "~/layouts/page";
import { Post } from "~/types/post";
import { getPosts, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";

type Props = {
  posts: Post[];
  tags: string[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      posts: getPosts(),
      tags: getTags(),
    },
  };
};

export default function View(props: Props) {
  return (
    <Page title="">
      <h2>Tags</h2>
      <Tags tags={props.tags} className="mb-8" />
      <h2>Posts</h2>
      <ul>
        {props.posts.map((post) => (
          <li key={post.slug} className="mb-5">
            <div className="italic text-xs text-gray-400">
              {formatDate(post.date)}
            </div>
            <Link href={`/${post.year}/${post.month}/${post.slug}`}>
              <a className="font-semibold">{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
