---
title: Next.js で React Hook Form (yup または zod を含む) を使う
created_at: "2021-04-21"
last_updated: "2023-01-29"
tags: [next, react]
---

## はじめに

フォームのバリデーションをクライアントサイドで実装して、サーバーサイドで実装して、それらを良い感じに繋げて、とやっていくとわりとめんどうだったので React Hook Form と yup または zod の組み合わせで実装してみた。

## 環境

- TypeScript 4.7.x
- Next.js 12.2.x
- React Hook Form 7.33.x
- yup 0.32.x
- zod 3.17.x

## ディレクトリ構成

Next.js なプロジェクトの場合、以下のような感じになった:

```
├── package.json
├── src
│   ├── pages
│   │   ├── ...
│   │   ├── index.tsx
│   │   ├── yup.tsx
│   │   └── zod.tsx
│   ├── styles
│   │   ├── app.css
│   │   └── form.module.css
│   └── validations
│       ├── yup-locale.ts
│       ├── yup-schema1.ts
│       └── zod-schema1.ts
├── ...
```

## Schema Validation の実装

ここでいう Schema とは Database Table の Column だと思っていい。そしてここで実装するものはあくまでクライアントサイドのバリデーションだということを認識しておく。

pages ディレクトリ以下のコンポーネントに直接書いてもいいわけだが、例えば yup から zod に移行したいなぁってときに楽ができるように validations ディレクトリ以下に詳細を書くことにする。これで差し替えが容易になる。

yup は locale をセットできるのでやっておく。zod はない？

```ts[data-file="src/validations/yup-locale.ts"]
import { setLocale } from "yup";

setLocale({
  mixed: {
    required: "The ${path} cannot be blank.",
  },
});
```

```ts[data-file="src/validations/yup-schema1.ts"]
import "./yup-locale";
import { object, string } from "yup";
import type { InferType } from "yup";

// まずは Schema を定義する
const schema = object({
  // foo はラベルに foo という文字列を使い、文字列型であり、必須項目とする
  foo: string().label("foo").required(),

  // bar はラベルに bar という文字列を使い、
  // b, a, r のいずれかの文字のみを許可する (ただし空文字でもよい)
  bar: string()
    .label("bar")
    .matches(/^(b|a|r)$/, {
      excludeEmptyString: true,
      message: 'The ${path} must be one of "b" "a" "r".',
    }),
});

// Schema から型を定義する
type Schema = InferType<typeof schema>;

// データ作成用のフォームの Schema と型を export する
export const schemaOnCreate = schema;
export type SchemaOnCreate = Schema;

// データ更新用のフォームの Schema と型を export する
// 以下の場合、定義された Schema のうち bar のみを更新用のフォームとして使う、という意味
export const schemaOnUpdate = schema.pick(["bar"]);
export type SchemaOnUpdate = InferType<typeof schemaOnUpdate>;

// フォームで使うラベルを export する
export const label: Record<keyof Schema, string> = {
  foo: "Foo",
  bar: "Bar",
};
```

だいたい上記のような書き方に落ち着いた。これでほぼすべて VSCode などで補完が効くし、変なもんが混じってるとエラーで教えてくれるし、ある程度の秩序は保つことができる。

zod で書く場合は以下:

```ts[data-file="src/validations/zod-schema1.ts"]
import type { infer as InferType } from "zod";
import { literal, object, string } from "zod";

const schema = object({
  foo: string().min(1, "The foo cannot be blank."),
  bar: string()
    .regex(/^(b|a|r)$/, `The bar must be one of "b" "a" "r".`)
    .optional()
    .or(literal("")),
});

type Schema = InferType<typeof schema>;

export const schemaOnCreate = schema;
export type SchemaOnCreate = Schema;

export const schemaOnUpdate = schema.pick({ bar: true });
export type SchemaOnUpdate = InferType<typeof schemaOnUpdate>;

export const label: Record<keyof Schema, string> = {
  foo: "Foo",
  bar: "Bar",
};
```

書き方としては yup と非常に似ているが、locale と label がないので若干管理がめんどくさそう。また、 yup より zod のほうが型については厳密さがあり、React Hook Form と組み合わせた場合、ちょっとした工夫が必要になったりする (詳細はここでは省く) 。

## フォームの実装

React Hook Form と yup を組み合わせたもの:

```tsx[data-file="src/pages/yup.tsx"]
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import styles from "../styles/form.module.css";
import { schemaOnCreate as schema, label } from "../validations/yup-schema1";
import type { SchemaOnCreate as Schema } from "../validations/yup-schema1";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: Schema) => {
    alert(JSON.stringify(data));
  };

  return (
    <>
      <h1>yup</h1>
      <p>
        <span className={styles.required}>*</span> is a required field.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="foo" className={`required ${styles.label}`}>
          {label.foo}
        </label>
        <input {...register("foo")} id="foo" className={styles.input} />
        <div className={styles.error}>{errors.foo?.message}</div>
        <label htmlFor="bar" className={styles.label}>
          {label.bar}
        </label>
        <input {...register("bar")} id="bar" className={styles.input} />
        <div className={styles.error}>{errors.bar?.message}</div>
        <button type="submit" className={styles.button}>
          Create
        </button>
      </form>
    </>
  );
}
```

React Hook Form と zod を組み合わせたフォーム:

```tsx[data-file="src/pages/zod.tsx"]
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import styles from "../styles/form.module.css";
import { schemaOnCreate as schema, label } from "../validations/zod-schema1";
import type { SchemaOnCreate as Schema } from "../validations/zod-schema1";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Schema) => {
    alert(JSON.stringify(data));
  };

  return (
    <>
      <h1>zod</h1>
      <p>
        <span className={styles.required}>*</span> is a required field.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="foo" className={`required ${styles.label}`}>
          {label.foo}
        </label>
        <input {...register("foo")} id="foo" className={styles.input} />
        <div className={styles.error}>{errors.foo?.message}</div>
        <label htmlFor="bar" className={styles.label}>
          {label.bar}
        </label>
        <input {...register("bar")} id="bar" className={styles.input} />
        <div className={styles.error}>{errors.bar?.message}</div>
        <button type="submit" className={styles.button}>
          Create
        </button>
      </form>
    </>
  );
}
```

Form validation 用の Schema の定義を外に逃しているので、 yup, zod ともにほぼ同じ書き方になる。ただし number 型とか出てくると React Hook Form + zod を組み合わせた場合に { valueAsNumber: true } みたいなオプションを書かないといけなかったりするので注意が必要。

## サーバーサイドバリデーションと組み合わせる

上記でやってきたことはすべてクライアントサイドのバリデーションであるため、サーバーサイドのバリデーションと良い感じに繋げるための実装が必要になってくる。

以下のようになった:

```tsx[data-file="src/pages/yup.tsx"]
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import styles from "../styles/form.module.css";
import { schemaOnCreate as schema, label } from "../validations/yup-schema1";
import type { SchemaOnCreate as Schema } from "../validations/yup-schema1";

export default function Page() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: Schema) => {
    const response = await fetch("https://api.example.com/somewhere", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const { errors } = await response.json();

    if (errors) {
      for (const [name, message] of Object.entries(errors)) {
        setError(name as keyof Schema, {
          type: "server",
          message: message as string,
        });
      }
    } else {
      router.push({ pathname: "/somewhere" });
    }
  };

  return (
    <>
      <h1>yup</h1>
      <p>
        <span className={styles.required}>*</span> is a required field.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="foo" className={`required ${styles.label}`}>
          {label.foo}
        </label>
        <input {...register("foo")} id="foo" className={styles.input} />
        <div className={styles.error}>{errors.foo?.message}</div>
        <label htmlFor="bar" className={styles.label}>
          {label.bar}
        </label>
        <input {...register("bar")} id="bar" className={styles.input} />
        <div className={styles.error}>{errors.bar?.message}</div>
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          Create
        </button>
      </form>
    </>
  );
}
```
HTTP Client によって書き方が変わるし、認証情報なども必要であったり、Response の形式や構造も様々だが、API サーバーにアクセスしてサーバーサイドのバリデーションに失敗した場合に返ってくる内容を useForm の setError に入れてやる、という流れ。これでクライアントサイド、サーバーサイド両方のバリデーション失敗時のメッセージを良い感じに表示できるようになる。

## まとめ

今回紹介した内容はあくまで基本であって、実際プロジェクトに導入する場合はより工夫が必要になってくる。そのために React Hook Form では [Advanced](https://react-hook-form.com/advanced-usage) なドキュメントが設けられているので是非読んでおきたい。

## 備考

ちなみに、この記事を書くにあたって [Blitz](https://blitzjs.com/) を少し触ってみたのだが (zod を採用しているため)、バージョン 0.34.x 現在では [React Final Form](https://final-form.org/react) を推奨していて (React Hook Form も使える)、CLI でモデルなどのファイルを自動生成した場合の内容がわりと興味深かったので、気になる人は触ってみるのも良いかもしれない。

また、クライアントサイド、サーバーサイドのバリデーションの役割などを知りたい場合は [Quora: クライエント側のバリデーションとサーバーサイド側のバリデーションをどのような点を意識して、使い分けますか？](https://jp.quora.com/%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A8%E3%83%B3%E3%83%88%E5%81%B4%E3%81%AE%E3%83%90%E3%83%AA%E3%83%87%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%A8%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%B5%E3%82%A4%E3%83%89) が詳しい。

## 関連リンク

- [React Hook Form](https://react-hook-form.com/)
- [GitHub: react-hook-form/resolvers](https://github.com/react-hook-form/resolvers)
- [GitHub: jquense/yup](https://github.com/jquense/yup)
- [GitHub: colinhacks/zod](https://github.com/colinhacks/zod)
