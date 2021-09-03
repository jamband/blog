import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { HomeLink } from "~/components/home-link";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants/app";
import { Page } from "~/layouts/page";
import type { Post } from "~/types/post";
import { getPostsByTag, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";

type Props = {
  posts: Post[];
  tags: string[];
};

type Params = {
  params: {
    tag: string;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  return {
    props: {
      posts: getPostsByTag(params.tag),
      tags: getTags(),
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: getTags().map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: false,
  };
};

export default function View(props: Props) {
  const router = useRouter();
  const tag = router.query.tag?.toString() || "";

  return (
    <Page title={tag}>
      <h2>Tags</h2>
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={`${tag} ･ ${APP_NAME}`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={`${APP_URL}tags/${tag}`} />
      </Head>
      <Tags tags={props.tags} className="mb-8" decoration />
      <h2>
        Posts <span className="text-xs text-gray-400 tracking-widest">#</span>
        <span className="text-sm text-purple-400">{tag}</span>
      </h2>
      <ul>
        {props.posts.map((post) => (
          <li key={post.slug} className="mb-6">
            <div className="text-xs italic text-gray-400">
              {formatDate(post.date)}
            </div>
            <Link href={`/${post.year}/${post.month}/${post.slug}`}>
              <a className="font-semibold">{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-16 text-center">
        <HomeLink />
      </p>
    </Page>
  );
}
