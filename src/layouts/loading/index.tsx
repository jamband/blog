import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Component } from "./component";
import styles from "./style.module.css";
import type { State } from "./types";

export const Loading: React.VFC = () => {
  const [state, setState] = useState<State>("initial");
  const router = useRouter();

  let className = styles.initial;
  if (state === "start") {
    className += ` ${styles.start}`;
  }
  if (state === "complete") {
    className += ` ${styles.complete}`;
  }

  useEffect(() => {
    const start = (url: string) => {
      if (router.asPath !== url) {
        setState("start");
      }
    };

    const complete = (url: string) => {
      if (router.asPath !== url) {
        setTimeout(() => {
          setState("complete");
        }, 100);

        setTimeout(() => {
          setState("initial");
        }, 500);
      }
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", complete);
    router.events.on("routeChangeError", complete);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", complete);
      router.events.off("routeChangeError", complete);
    };
  }, [router]);

  return <Component className={className} />;
};
