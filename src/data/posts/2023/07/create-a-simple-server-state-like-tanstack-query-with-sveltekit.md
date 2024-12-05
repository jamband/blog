---
title: SvelteKit で TanStack Query (FKA React Query) っぽい簡易的な Server State を作成する
created_at: "2023-07-31"
last_updated: "2024-03-03"
tags: [svelte, sveltekit]
---

## はじめに

SvelteKit を使っているプロジェクトに簡易的な Server State が欲しかったので作ってみた。

## 環境

- Node.js 18.x
- Svelte 4.x
- SvelteKit 1.x
- Vitest 0.33.x
- msw 1.x

## Server State とは

ここで言う Server State とは バックエンドの Web API からのレスポンスを一時的にフロントエンドでキャッシュし管理することを言う。

React だと [TanStack Query](https://tanstack.com/query/latest) や [SWR](https://swr.vercel.app/) が有名で、Svelte にも [TanStack Query の Svelte 版](https://tanstack.com/query/latest/docs/framework/svelte/overview) があるのだが、Server State 系のライブラリはけっこう高機能でかつ API が複雑なものが多く、導入のハードルも高く、保守もそこまで容易ではない。

そのため、簡単な要件を満たす簡易的な Server State を Svelte のカスタムストアで作ることにした。

## 要件

- JavaScript のメモリにデータ (Server State) を格納する
- ページ (ルート) が遷移しても、データは保持され続ける
- ブラウザのリロードなどが発生した場合は、データがクリアされてもいい
- 一定期間が過ぎるとデータは破棄され、再度取得される
- 一定のデータ量を超えた場合、すべてのデータを破棄する

おそらくこれ以上のものが必要な場合は、素直に何らかのライブラリを使ったほうがいいかもしれない。

## 作ってみる

まずはじめに最小限な機能を持ったものを作る:

```ts title="src/stores/server-state.ts"
import { writable } from "svelte/store";

export const serverState = <T>(key: string) => {
  const { set, subscribe } = writable<null | Error | T>(null);

  return {
    subscribe,
    fetch: async () => {
      try {
        const response = await fetch(key);

        if (response.ok) {
          const data = await response.json();
          set(data);
        } else {
          const error = new Error("Not Found");
          set(error);
        }
      } catch (_) {
        const error = new Error("Internal Server Error");
        set(error);
      }
    },
  };
};
```

エラーハンドリングが雑だが、返されるレスポンスの HTTP ステータスコードが 4xx ならすべて "Not Found"、5xx なら "Internal Server Error" がエラーオブジェクトにセットされる。これでエラーが発生した場合にどこに原因があるかを安易ではあるが確認することができる。

Svelte テンプレートでは以下のようにして使う:

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { serverState } from "../../stores/server-state";

  type Todo = {
    title: string;
  };

  const API_URL = "https://jsonplaceholder.typicode.com";
  $: id = $page.url.searchParams.get("todos") || "1";
  $: todo = serverState<Todo>(`${API_URL}/todos/${id}`);

  afterNavigate(async () => {
    await todo.fetch();
  });
</script>

<h1>home</h1>
<a href="/foo">foo</a>
<hr />
<ul>
  <li><a href="/?todos=1">todos1</a></li>
  <li><a href="/?todos=2">todos2</a></li>
  <li><a href="/?todos=3">todos3</a></li>
</ul>
{#if $todo === null}
  <div>Loading...</div>
{:else if $todo instanceof Error}
  <div>{$todo}</div>
{:else}
  <div>{$todo.title}</div>
{/if}
```

serverState<データの型>("キー"); でデータの状態を定義し、任意のタイミングで serverState.fetch() を呼び出す。今回はバックエンドを用意していないので [JSONPlaceholder](https://jsonplaceholder.typicode.com) を利用している。

Web ブラウザの DevTools などを利用して Fetch API が呼び出されているかを確認する。Google Chrome の場合は DevTools > Network で Fetch/XHR などに絞ってリクエストの詳細を確認することができる。

todos1, todos2, todos3 のリンクをクリックしても、おそらく毎回リクエストが発生している。つまり、今のままではサーバから取得したデータはキャッシュされていないことになる。

## テストを書く

とりあえずここまで書いたコードのテストを追加する。Vitest とグローバルな fetch をモックする msw を使って書く。

Vitest と msw のインストール:

```
npm i vitest msw
```

いくつかの設定ファイルを更新:

```ts title="vite.config.ts"
/// <reference types="vitest" />

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.test.ts"],
    globals: true,
  },
});
```

```json title="tsconfig.json"
{
  // ...
  "compilerOptions": {
    "types": ["vitest/globals"],
    // ...
  }
}
```

テストの作成:

```ts title="src/stores/server-state.test.ts"
import { rest } from "msw";
import { setupServer } from "msw/node";
import { get } from "svelte/store";
import { serverState } from "./server-state";

const server = setupServer();
const API_URL = "http://localhost:8000";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test("initial value", () => {
  const store = serverState(`${API_URL}/foo`);
  expect(get(store)).toBe(null);
});

test("fetch: ok", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.json({ foo: "bar" }));
    })
  );

  const store = serverState(`${API_URL}/foo`);
  await store.fetch();
  expect(get(store)).toEqual({ foo: "bar" });
});

test("fetch: 4xx error", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.status(404));
    })
  );

  const store = serverState(`${API_URL}/foo`);
  await store.fetch();
  expect(get(store)).toEqual(new Error("Not Found"));
});

test("fetch: 5xx error", async () => {
  const store = serverState("/wrong/key");
  await store.fetch();
  expect(get(store)).toEqual(new Error("Internal Server Error"));
});
```

ストアの初期値とグローバル fetch のレスポンスのテスト (正常系・異常系) くらいでとりあえず OK。

## データのキャッシュ機能を追加する

次にサーバからのレスポンスをキャッシュする機能を追加する。いろいろな実装方法があると思うが、今回はデータのサイズやクリアを容易にするために [Map](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Map) オブジェクトを使う。

```ts title="src/stores/server-state.ts"
import { writable } from "svelte/store";

export const cache = new Map<string, unknown>(); // 追加

export const serverState = <T>(key: string) => {
  const { set, subscribe } = writable<null | Error | T>(null);

  return {
    subscribe,
    fetch: async () => {
      // キャッシュがあればストアにキャッシュの値をセットする
      if (cache.has(key)) {
        set(cache.get(key) as T);
        return;
      }

      try {
        const response = await fetch(key);

        if (response.ok) {
          const data = await response.json();
          cache.set(key, data); // データをキャッシュする
          set(data);
        } else {
          const error = new Error("Not Found");
          set(error);
        }
      } catch (_) {
        const error = new Error("Internal Server Error");
        set(error);
      }
    },
  };
};
```

再度、Web ブラウザの DevTools などを利用して Fetch API のリクエスト回数を確認する。データのキャッシュ機能を追加したことによって、todos1, todos2, todos3 のリンクをクリックしても、初回のみ Fetch API のリクエストが発生し、2 回目以降はリクエストされずキャッシュされたデータが使われているはず。

それらを保証するテストを追加しておく:

```ts title="src/stores/server-state.test.ts"
import { rest } from "msw";
import { setupServer } from "msw/node";
import { get } from "svelte/store";
import { cache, serverState } from "./server-state";

const server = setupServer();
const API_URL = "http://localhost:8000";

// ...

afterEach(() => {
  server.resetHandlers();
  cache.clear(); // テスト毎にキャッシュをクリアする
});

// ...

test("cache", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.json({ foo: "bar" }));
    })
  );

  const mock = vi.spyOn(global, "fetch"); // global な fetch をモックする
  const store = serverState(`${API_URL}/foo`);

  await store.fetch();
  expect(get(store)).toEqual({ foo: "bar" }); // ストアのデータをテストする
  expect(mock).toHaveBeenCalledTimes(1); // モックが呼ばれた回数をテストする

  await store.fetch(); // 再度 fetch する
  expect(get(store)).toEqual({ foo: "bar" }); // ストアのデータをテストする
  expect(mock).toHaveBeenCalledTimes(1); // 1 回目の fetch 時にデータがキャッシュされるため、モックが呼ばれる回数は増えない
});
```

## キャッシュを破棄する機能を追加する

このままではキャッシュされたデータはブラウザのリロードなどが発生しない限り無期限で使われることになる。例えば、バックエンド側のデータになんらかの変更があった場合、フロントエンド側との整合性が即座に失われる。

それらを改善する方法はいくつかあると思うが、今回はあくまで「簡易的な Server State を作ること」が目的であるため、キャッシュされたデータの破棄も簡易的に実装する。

- キャッシュされたデータが 100 個以上格納されている場合、すべてを破棄する
- キャッシュされたデータに有効期限を設ける

カスタムストアを以下のように更新する:

```ts title="src/stores/server-state.ts"
import { writable } from "svelte/store";

// キャッシュの値の型を定義する
type Value = {
  data: unknown;
  expiry: number;
};

export const cache = new Map<string, Value>();

// 第二引数に有効期限を指定できる revalidate を追加する
export const serverState = <T>(key: string, revalidate: number) => {
  const { set, subscribe } = writable<null | Error | T>(null);

  return {
    subscribe,
    fetch: async () => {
      // キャッシュのアイテム数が 100 を超えた場合、キャッシュをすべて破棄する
      if (cache.size > 100) {
        cache.clear();
        return;
      }

      // キャッシュが存在し、有効期限が切れていなければ、ストアにデータをセットする
      const value = cache.get(key);
      if (value && value.expiry > Date.now()) {
        set(value.data as T);
        return;
      }

      // 有効期限の値を秒数に変換する
      const expiry = Date.now() + revalidate * 1000;

      try {
        const response = await fetch(key);

        if (response.ok) {
          const data = await response.json();
          cache.set(key, { data, expiry }); // データと有効期限をキャッシュにセットする
          set(data);
        } else {
          const error = new Error("Not Found");
          set(error);
        }
      } catch (_) {
        const error = new Error("Internal Server Error");
        set(error);
      }
    },
  };
};
```

カスタムストアに新たな引数が追加されたため、Svelte テンプレートも更新する:

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { serverState } from "../../stores/server-state";

  type Todo = {
    title: string;
  };

  const API_URL = "https://jsonplaceholder.typicode.com";
  $: id = $page.url.searchParams.get("todos") || "1";
  $: todo = serverState<Todo>(`${API_URL}/todos/${id}`, 60 * 10); // キャッシュの有効期限を 10 分にする

  afterNavigate(async () => {
    await todo.fetch();
  });
</script>

<h1>home</h1>
<a href="/foo">foo</a>
<hr />
<ul>
  <li><a href="/?todos=1">todos1</a></li>
  <li><a href="/?todos=2">todos2</a></li>
  <li><a href="/?todos=3">todos3</a></li>
</ul>
{#if $todo === null}
  <div>Loading...</div>
{:else if $todo instanceof Error}
  <div>{$todo}</div>
{:else}
  <div>{$todo.title}</div>
{/if}
```

テストも更新する:

```ts title="src/stores/server-state.test.ts"
import { rest } from "msw";
import { setupServer } from "msw/node";
import { get } from "svelte/store";
import { cache, serverState } from "./server-state";

const server = setupServer();
const API_URL = "http://localhost:8000";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  cache.clear();
});

afterAll(() => {
  server.close();
});

test("initial value", () => {
  const store = serverState(`${API_URL}/foo`, 0);
  expect(get(store)).toBe(null);
});

test("fetch: ok", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.json({ foo: "bar" }));
    })
  );

  const store = serverState(`${API_URL}/foo`, 0);
  await store.fetch();
  expect(get(store)).toEqual({ foo: "bar" });
});

test("fetch: 4xx error", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.status(404));
    })
  );

  const store = serverState(`${API_URL}/foo`, 0);
  await store.fetch();
  expect(get(store)).toEqual(new Error("Not Found"));
});

test("fetch: 5xx error", async () => {
  const store = serverState("/wrong/key", 0);
  await store.fetch();
  expect(get(store)).toEqual(new Error("Internal Server Error"));
});

test("cache", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.json({ foo: "bar" }));
    })
  );

  const mock = vi.spyOn(global, "fetch");
  const store = serverState(`${API_URL}/foo`, 60); // 60 秒間データをキャッシュする
  await store.fetch();
  expect(get(store)).toEqual({ foo: "bar" });
  expect(mock).toHaveBeenCalledTimes(1);

  await store.fetch(); // 再度 fetch する
  expect(get(store)).toEqual({ foo: "bar" });
  expect(mock).toHaveBeenCalledTimes(1); // モックが呼ばれた回数が増えていないことをテストする
});

// 追加
test("no cache", async () => {
  server.use(
    rest.get(`${API_URL}/foo`, (_, response, context) => {
      return response(context.json({ foo: "bar" }));
    })
  );

  const mock = vi.spyOn(global, "fetch");
  const store = serverState(`${API_URL}/foo`, 0); // revalidate を 0 にし、常にキャッシュの再検証をする

  await store.fetch();
  expect(get(store)).toEqual({ foo: "bar" });
  expect(mock).toHaveBeenCalledTimes(1); // モックが呼ばれた回数をテストする

  await store.fetch(); // 再度 fetch する
  expect(get(store)).toEqual({ foo: "bar" });
  expect(mock).toHaveBeenCalledTimes(2); // モックが呼ばれた回数が増えていることをテストする
});
```

これで一応の完成である。

ブラウザで検証したい場合は、revalidate の値を数秒にしたり、キャッシュのアイテム数を数個にしてみたりして調整する。

## まとめ

今回は SvelteKit で簡易的な Server State を作ってみた。Svelte には [TanStack Query の Svelte 版](
https://tanstack.com/query/latest/docs/framework/svelte/overview) があるので、それを使えばより高機能ものを実装できる。が、それらのライブラリをしっかりと理解したうえで使用し、長期的に保守できるかと自問すると「けっこう大変」という答えになる。

React 版の [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) も React の Server Component や Next.js の App Router が出てきたあたりから、どのように使い分ければいいんだろう？と迷うことがよくある。この問題は現在進行中であり、Next.js の [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) が stable にならない限り解決できない問題ではあるが、いずれにせよ、便利なライブラリを長期に渡って使い続けていくのがより難しくなってきているなぁと最近よく感じる。

そのような理由から、今回は何かしらのライブラリを利用するのを避けて、自作するという選択をした。もちろん、要件が多く複雑である場合は、結果的に自作するほうがいろいろ大変になることもあるので注意する。

## 関連リンク

- [Stores / Custom stores • Svelte Tutorial](https://learn.svelte.dev/tutorial/custom-stores)
- [TanStack Query](https://tanstack.com/query/latest)
- [@tanstack/svelte-query](https://tanstack.com/query/latest/docs/framework/svelte/overview)
