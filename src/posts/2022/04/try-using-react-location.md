---
title: React Location を使ってみる
created_at: "2022-04-19"
last_updated: "2022-07-03"
tags:
    - react
---

## はじめに

少し前から気になっていた React のルーティングライブラリである React Location を使ってみた。React Location にはどのような特徴があるのか、また React Router との違いなどについても書いていく。

## 環境

- Library: React 18.x
- Routing: React Location 3.x
- State management: Jotai 1.x
- Building: Vite 2.x
- Testing: Vitest 0.16.x
- Hosting: Cloudflare Pages

## 作ったもの

上記の環境で以下を作った。

- [Experinica](https://experinica.pages.dev/)
- [GitHub: jamband/experinica](https://github.com/jamband/experinica)

Experinica は自分が以前作った [jamband/tapes](https://jamband.github.io/tapes/) のコピー品のようなものである。jamband/tapes は本番環境にビルド・デプロイすると、各 route はそれに対応する HTML と JSON ファイルを生成する。詳細は以下で確認できる。

- [GitHub: jamband/tapes - gh-pages](https://github.com/jamband/tapes/tree/gh-pages)

Experinica では jamband/tapes で生成された JSON ファイルを Fetch API を用いてリクエストしデータを取得する。スタイルなどはほぼ jamband/tapes に合わせているため、結果的に見た目は同じようなものになる。ただ jamband/tapes は SvelteKit を使った静的サイト + SPA のようなものであるのに対して、Experinica は完全なる SPA であることに注意する。

## React Location の特徴

React Location は React のルーティングライブラリである。アプリケーションの各 route を配列オブジェクトで構成する。以下のような感じ:

```js:[data-file="/src/routes/index.tsx"]
import type { Route } from "@tanstack/react-location";

const routes: Array<Route> = [
  {
    path: "/",
    element: "home...",
  },
  {
    path: "foo",
    element: "foo...",
  },
];

export default routes;
```

あとは Router プロバイダーコンポーネントの props に構成した routes を読み込ませる:

```tsx:[data-file="/src/index.tsx"]
import { ReactLocation, Router } from "@tanstack/react-location";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import routes from "./routes";

const container = document.getElementById("app");
if (container === null) throw new Error("Root element does not exists.");

createRoot(container).render(
  <StrictMode>
    <Router location={new ReactLocation()} routes={routes} />
  </StrictMode>
);
```

開発サーバを立ち上げて Web ブラウザで以下にアクセスする (ポート番号は任意):

```
http://localhost:3000
// home... と表示されるか確認する

http://localhost:3000/foo
// foo... と表示されるか確認する
```

基本はこんな感じ。

では React Router と比較した場合、React Location には他にどのような機能があるのかを見ていく。

1 つ目は [Route Loaders](https://react-location.tanstack.com/guides/route-loaders) 。各 route はだいたいの場合 API サーバからデータを取得するよね？それらの実装は loader プロパティを使って非同期な関数で書けるよ、といった感じ。

たとえば /(ホーム) route に対していくつかのデータを API サーバから取得したい場合は以下:

```tsx[data-file="/src/routes/index.tsx"]
import type { Route } from "@tanstack/react-location";
import Home from "./home";

const routes: Array<Route> = [
  {
    path: "/",
    element: <Home />,
    loader: async () => ({
      foo: await fetch("https://api.example.com/foo").then((res) => res.json()),
      bar: await fetch("https://api.example.com/bar").then((res) => res.json()),
    }),
  },
];

export default routes;
```

Home コンポーネントでは [useMatch](https://react-location.tanstack.com/docs/api#usematch) フックをつかってデータを取得する:

```tsx[data-file="/src/routes/home.tsx"]
import { useMatch } from "@tanstack/react-location";

export default function Home() {
  const {
    data: { foo, bar },
  } = useMatch();

  return (
    <>
      <h2>Foo</h2>
      <ul>
        {foo.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <h2>Bar</h2>
      <ul>
        {bar.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </>
  );
}
```

特徴的なのは、すべてのデータを取得後に DOM をレンダリングするところ。なので、ローディングスピナー地獄であったり、一瞬レイアウトが崩れてしまったり、画面がちらついたり、といったことを気にしなくていい。

データの型は MakeGenerics を使って書く:

```ts[data-file="/src/types/location.ts"]
import type { MakeGenerics } from "@tanstack/react-location";

export type LocationGenerics = MakeGenerics<{
  LoaderData: {
    foo: Array<{ id: number; name: string }>;
    bar: Array<{ id: number; title: string }>;
  };
  Params: {
    // ...
  };
}>;
```

```tsx[data-file="/src/routes/index.tsx"]
import type { Route } from "@tanstack/react-location";
import type { LocationGenerics } from "../types/location";

const routes: Array<Route<LocationGenerics>> = [
  // ...
];

export default routes;
```

```tsx[data-file="/src/index.tsx"]
import { ReactLocation, Router } from "@tanstack/react-location";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import routes from "./routes";
import type { LocationGenerics } from "./types/location";

const container = document.getElementById("app");
if (container === null) throw new Error("Root element does not exists.");

createRoot(container).render(
  <StrictMode>
    <Router location={new ReactLocation<LocationGenerics>()} routes={routes} />
  </StrictMode>
);
```

```tsx[data-file="/src/routes/home.tsx"]
import { useMatch } from "@tanstack/react-location";
import type { LocationGenerics } from "../types/location";

export default function Home() {
  const {
    data: { foo, bar },
  } = useMatch<LocationGenerics>();

  // ...
}
```

2 つ目は、現状 Server-Side Rendering (SSR) をサポートしていないところ。そのため使い所は限定される。個人的には React Location の書き心地が良いので、SSR をサポートしつつ、どこかのフレームワーク内部で使われたら最高なのに... とか浅い感想を持っているが、React 18 以降のことであったり、React Router との違いを考えると、今後どうなるかは不明。

3 つ目は、[Search Params](https://react-location.tanstack.com/docs/api#search-params) 。これは Route の [Path](https://react-location.tanstack.com/guides/routes#routes-paths) や [Path Params](https://react-location.tanstack.com/guides/routes#path-params) では表現できないより細かな制御を必要とするときに使う。複数の状態を URL の query string に持たせて特定のデータを検索したい場合など、つまり管理画面などではよく使われそうな機能。

その他の細かな比較に関しては [Comparison | React Location vs React Router](https://react-location.tanstack.com/comparison) が参考になる。

## Route 間の移動について

[Link](https://react-location.tanstack.com/docs/api#link) コンポーネントを使うことによって route 間を移動できる。

```tsx[data-file="/src/routes/home.tsx"]
import { Link } from "@tanstack/react-location";

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <Link to="/foo">Foo</Link>
    </>
  );
}
```

また、[useNavigate](https://react-location.tanstack.com/docs/api#usenavigate) フックを使用することによってプログラムよるナビゲーションができる。

```tsx[data-file="/src/routes/home.tsx"]
import { useNavigate } from "@tanstack/react-location";

export default function Home() {
  const navigate = useNavigate();
  const toFoo = () => navigate({ to: "/foo" });

  return <button onClick={toFoo}>Foo →</button>;
}
```

## Route Loaders のキャッシュについて

React Location には Route Loaders のキャッシュを制御するために [React Location Simple Cache](https://react-location.tanstack.com/tools/simple-cache) というパッケージが用意されている。簡易的なキャッシュについてはこれを使う。管理画面のようなより複雑なものに対しては [React Query](https://react-query.tanstack.com/) のほうがより制御しやすいかもしれない。

ちなみに [Experinica](https://experinica.pages.dev/) では [React Location Simple Cache](https://react-location.tanstack.com/tools/simple-cache) を使っている。ローディングを表現するスピナーが表示される場合は API サーバにリクエストしている状態であり、一度リクエストしたものは JavaScript のメモリにキャッシュされ、再度同じルートに移動した場合はそのキャッシュが使われスピナーは表示されない。

ただ、これはあくまで JavaScript のメモリによるキャッシュであるため、Web ブラウザをリロードすると破棄される。

## コンポーネントのテストについて

特定のコンポーネントが React Location のなにかしらに依存していて、そのままではテストが行えない場合は、デフォルトの Browser Routing から [Memory Routing](https://react-location.tanstack.com/guides/history-types-and-location#memory-routing) に切り替えてテストを行う。

例えば以下のようなコンポーネントがあった場合:

```tsx[data-file="/src/components/foo/index.tsx"]
import { useLocation } from "@tanstack/react-location";

export const Foo: React.FC = () => {
  const { current } = useLocation();
  const text = current.pathname === "/foo" ? "foo" : "???";
  return <h2>{text}</h2>;
};
```

以下のようにテストを書くことができる:

```tsx[data-file="/src/components/foo/index.test.tsx"]
import {
  createMemoryHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import { render, screen } from "@testing-library/react";
import type { MemoryHistoryOptions } from "history";
import { expect, test } from "vitest";
import { Foo } from ".";

const location = (historyOptions: MemoryHistoryOptions) =>
  new ReactLocation({
    history: createMemoryHistory(historyOptions),
  });

test("現在のルートが /foo の場合は foo と表示される", () => {
  render(
    <Router location={location({ initialEntries: ["/foo"] })} routes={[]}>
      <Foo />
    </Router>
  );
  expect(screen.getByRole("heading", { name: "foo" })).toBeInTheDocument();
});

test("現在のルートが /foo 以外の場合は ??? と表示される", () => {
  render(
    <Router location={location({ initialEntries: ["/"] })} routes={[]}>
      <Foo />
    </Router>
  );
  expect(screen.getByRole("heading", { name: "???" })).toBeInTheDocument();
});
```

## まとめ

この記事を書いているちょっと前に React のバージョン 18 がリリースされた。周辺のライブラリも React 18 のサポートを進めている。

そんな中でこの記事を書いていて、ちょっとタイミングが悪いなと思いつつ、それでも改めて感じたのは、今回使った [React Location](https://react-location.tanstack.com/) やその他の [TanStack](https://tanstack.com/) のライブラリも含め、 やっぱ React って周辺のライブラリも含めてほんと充実していて、質が高いものが多いなぁと。

また、今回初めて試しに使ってみた状態管理ライブラリである [Jotai](https://github.com/pmndrs/jotai) も非常に使いやすかったし、またどこかで使ってみたい。

## 関連リンク

- [React Location](https://react-location.tanstack.com/)
- [React Router](https://reactrouter.com/)
- [Experinica](https://experinica.pages.dev/)
- [GitHub: jamband/experinica](https://github.com/jamband/experinica)
