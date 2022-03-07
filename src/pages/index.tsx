import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Tags } from "~/components/tags";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants/app";
import { Page } from "~/layouts/page";
import type { Post } from "~/types/post";
import { getLatestPosts, getOldPosts, getTags } from "~/utils/api";
import { formatDate } from "~/utils/format";

type Props = {
  tags: string[];
  latestPosts: Post[];
  oldPosts: Post[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      tags: getTags(),
      latestPosts: getLatestPosts(),
      oldPosts: getOldPosts(),
    },
  };
};

export default function View(props: Props) {
  const [hideOldPosts, setHideOldPosts] = useState(true);
  const moreOldPosts = () => setHideOldPosts(false);

  return (
    <Page title="">
      <Head>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content={APP_URL} />
      </Head>
      <h2 className="mb-5">Tags</h2>
      <Tags tags={props.tags} className="mb-14" />
      <h2 className="mb-5">Posts</h2>
      <ul>
        {props.latestPosts.map((post) => (
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
      {hideOldPosts && (
        <div className="text-center">
          <button
            onClick={moreOldPosts}
            className="rounded bg-gray-700 px-5 py-1 text-gray-300 shadow-sm active:text-pink-500"
          >
            more old posts
          </button>
        </div>
      )}
      <ul style={{ display: hideOldPosts ? "none" : "block" }}>
        {props.oldPosts.map((post) => (
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
    </Page>
  );
}
