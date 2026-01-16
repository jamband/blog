---
title: hono/jwt を使って認証システムを構築する
created_at: "2026-01-16"
last_updated: "2026-01-16"
tags: [authentication, jwt, hono]
---

## はじめに

JWT の再入門的なノリで hono/jwt を使って認証システムを構築していく。

## 環境

- Node.js 22.x
- Hono 4.x
- SQLite 3.x
- Drizzle ORM 0.x

## hono/jwt とは

Hono で JWT を使いたい場合、Hono にビルトインされている hono/jwt を利用できる。hono/jwt は大きく分けて以下の 2 つの機能を持っている。

- hono/jwt の jwt 関数: JWT を使った認証関連のミドルウェア・ハンドラー
- hono/jwt の sign, verify, decode 関数など: JWT 関連のヘルパー関数

基本的な流れとしては hono/jwt の sign 関数を使って JWT を生成しクライアントに発行する。サーバ側は hono/jwt の jwt 関数でクライアントから送られてきた JWT を検証する。

上記の流れをコードで示すと以下のようになる:

```ts title="src/handlers/auth.ts"
import type { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { ACCESS_TOKEN_KEY } from "../constants/auth.js";
import env from "../env.js";

/*
 * auth 関連のミドルウェア・ハンドラー
 *
 * hono/jwt はデフォルトでは Authorization ヘッダーをチェックするが
 * 今回は Cookie を利用する。名前は access_token
 */
export function auth(c: Context, next: Next) {
  const middleware = jwt({
    secret: env.ACCESS_TOKEN_SECRET,
    alg: "HS256",
    cookie: ACCESS_TOKEN_KEY,
  });

  return middleware(c, next);
}
```

```ts title="src/routes/auth/login/handlers.ts"
import { setCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { sign } from "hono/jwt";
import { ACCESS_TOKEN_KEY } from "../../../constants/auth.js";
import env from "../../../env.js";

/*
 * ユーザのログイン
 *
 * とりあえず、認証情報の検証は省略し
 * 15 分間有効な JWT を hono/jwt の sign 関数で生成し
 * access_token という名前の Cookie でクライアントに渡す
 */
const factory = createFactory();

const loginHandlers = factory.createHandlers(
  async (c) => {
    const now = Math.floor(Date.now() / 1000);
    const userId = 1;

    const accessTokenExp = 60 * 15; // 15 minutes
    const accessToken = await sign(
      { sub: `${userId}`, exp: now + accessTokenExp },
      env.ACCESS_TOKEN_SECRET,
    );

    setCookie(c, ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: env.SECURE_COOKIE === undefined,
      domain: env.COOKIE_DOMAIN ?? undefined,
      sameSite: "Lax",
      path: "/",
      maxAge: accessTokenExp,
    });

    return c.body(null, 204);
  },
);

export default loginHandlers;
```

```ts title="src/routes/auth/logout/handlers.ts"
import { deleteCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { ACCESS_TOKEN_KEY } from "../../../constants/auth.js";
import { auth } from "../../../handlers/auth.js";

/*
 * ユーザのログアウト
 *
 * auth ミドルウェア・ハンドラーでログイン済みのユーザかを検証する
 * 検証が通らなかったら 401 を返す
 * 検証が通ったら access_token という Cookie を削除し 204 を返す
 */
const factory = createFactory();

const logoutHandlers = factory.createHandlers(auth, async (c) => {
  deleteCookie(c, ACCESS_TOKEN_KEY, { path: "/" });
  return c.body(null, 204);
});

export default logoutHandlers;
```

```ts title="src/routes/auth/app.ts"
import { Hono } from "hono";
import loginHandlers from "./login/handlers.js";
import logoutHandlers from "./logout/handlers.js";

/*
 * auth 関連のルーティンググループ
 */
const authApp = new Hono()
  .post("/login", ...loginHandlers)
  .post("/logout", ...logoutHandlers)

export default authApp;
```

```ts title="src/handlers/cors.ts"
import { cors as honoCors } from "hono/cors";
import env from "../env.js";

/*
 * CORS ミドルウェア・ハンドラー
 *
 * これも Hono にビルトインされているものを使う
 */
const cors = honoCors({
  origin: env.WEB_URL,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Accept", "Content-Type"],
  exposeHeaders: [],
  credentials: true,
  maxAge: 0,
});

export default cors;
```

```ts title="src/handlers/csrf.ts"
import { csrf as honoCsrf } from "hono/csrf";
import env from "../env.js";

/*
 * CSRF ミドルウェア・ハンドラー
 *
 * これも Hono にビルトインされているものを使う
 * トークンを用いた検証ではなく Origin ヘッダーを見るやつ
 * JWT をクライアントの Cookie に保存するので必要
 */
const csrf = honoCsrf({
  origin: env.WEB_URL,
});

export default csrf;
```

```ts title="src/handlers/logger.ts"
import { logger as honoLogger } from "hono/logger";
import env from "../env.js";

/*
 * 簡易的なロガー
 *
 * HTTP のステータスコードや
 * エラーログなどが追いやすくなるのであると助かる
 */
export const customLogger = (message: string, ...rest: Array<string>) => {
  if (env.LOG_LEVEL === "debug") {
    console.log(message, ...rest);
  }
};

const logger = honoLogger(customLogger);

export default logger;
```

```ts title="src/app.ts"
import { Hono } from "hono";
import cors from "./handlers/cors.js";
import csrf from "./handlers/csrf.js";
import logger from "./handlers/logger.js";
import authApp from "./routes/auth/app.js";

/*
 * アプリケーション全体のルーティング
 */
export const app = new Hono()
  .use(logger)
  .use(cors)
  .use(csrf)
  .route("/auth", authApp)
```

開発サーバを立ち上げて動作を確認する:

```ts title="src/server.ts"
import { serve } from "@hono/node-server";
import { app } from "./app.js";

/*
 * この記事では Node.js Runtime を利用する
 */
serve({
  fetch: app.fetch,
  port: 8000,
});
```

```json title="package.json"
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch --env-file=.env src/server.ts"
  },
  ...
}
```

```
npm run dev
```

フロントエンドは適当に Vite とかで作って検証する。

以上が最小限の hono/jwt を使った認証システムである。ユーザ情報の検証をしていないなどの根本的な問題があるが、それはとりあえず置いといて、次に上記の流れの中でどのようなことに注意するべきかなどについて探っていく。

## JWT を認証・認可に利用する場合の注意点

まず Hono で JWT を扱う場合は hono/jwt を使うこと。また、アルゴリズムを明示的に指定すること。この記事では HS256 を使用。

次に JWT の SECRET KEY。これは自分で生成して管理する必要がある。また、絶対に公開してはいけない。サーバ側に環境変数として持たせることになる。Node.js を使用している場合は以下のような関数を使って生成する:

```ts
import { randomBytes } from "node:crypto";

function generateSecret() {
  return randomBytes(256).toString("base64");
}
```

例えば、パスワードの総当たり攻撃等で突破するには相当の時間がかかるような値を用いること。

次に JWT の Payload に機密情報を持たせないこと。そのサービスの特性上 JWT の Payload になにかしらの情報を持たせたい場合もあると思うが、「JWT は誰でも簡単に中身が見れてしまうもの」なので、機密情報などは絶対に含めてはいけない。

最後に「hono/jwt とは」セクションで示したログアウトの実装だが、これはクライアントに保存されている access_token という Cookie を削除しているだけにすぎず、ユーザからしたらログアウトしたように見えるだけで「有効期限が切れていなければその JWT はまだ有効である」という状態だということを理解しておく必要がある。

例えば、何かしらのサービスで特定のユーザ本人がやってもいないようなアクションがあり、そのユーザがサービス側に問い合わせをし、サービス側がその対処をしようとしても、サーバ側にセッション認証などの状態を持っていないため、即座に対処できない、というようなことが起こりうる。

そのために access_token は有効期限を短く設定し、問題が発生した場合の影響範囲を最小限にするというような対策をとるわけだが、いわゆる「強制ログアウト」などができないシステムは良くない、ということで、次に、不完全な今の状態から、もう少しまともな実装になるようにコードを改善していく。

## データベースの用意

では、簡単なノートアプリを作る想定で、アプリケーションを構成していく。

まず、データベースを用意する。

```
npm i -E drizzle-orm @libsql/client bcryptjs
npm i -ED drizzle-kit
```

データベースは SQLite 3、ORM とマイグレーションツールは Drizzle を使う。

schema の作成:

```ts title="src/db/schema.ts"
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").unique().notNull(),
  password: text("password").notNull(),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
  token: text("token").unique().notNull(),
  revoked: integer("revoked", { mode: "boolean" }).default(false).notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at", { mode: "number" }).default(sql`(unixepoch())`).notNull(),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});
```

とりあえず、users テーブルと notes テーブルがあって、notes テーブルは users テーブルと紐づいている、みたいなことが分かっていれば OK。 refresh_tokens テーブルについては後で説明する。

作成した schema とマイグレーションツールを紐づける設定をする:

```ts title="drizzle.config.ts"
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  migrations: { table: "__migrations" },
  out: "./db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL || "" },
  schema: "./src/db/schema.ts",
});
```

schema からマイグレーションファイルを生成する:

```
npm exec --no -- drizzle-kit generate --name init
```

開発用にユーザを 1 件追加するマイグレーションファイルを生成する:

```
npm exec --no -- drizzle-kit generate --custom --name=seed-users
```

./db/migrations 以下に 0001_seed-users.sql というファイルが生成されるので
name: foo, password: foofoofoo なユーザを 1 件追加する SQL を書く:

```sql title="db/migrations/0001_seed-users.sql"
-- password: foofoofoo --
INSERT INTO `users` VALUES(1, 'foo', '$2b$12$gRA.A9J.TU62QG0/boQNIurTp/9BOMlmFbZ8n5/Sdk.f1c/lokLwO');
```

ちなみにハッシュ化したパスワードは以下で生成できる:

```
npm exec --no -- bcrypt foofoofoo 12
```

生成したマイグレーションファイルをデータベースに適用する:

```
npm exec --no -- drizzle-kit migrate
```

データベースのクライアントを用意する:

```ts title="src/db/client.ts"
import { drizzle } from "drizzle-orm/libsql";
import env from "../env.js";
import * as schema from "./schema.js";

const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
  },
  schema,
});

export default db;
```

## 認証・認可の実装

まず auth ミドルウェア・ハンドラーに auth 関数以外に guest 関数を新たに追加する。これは単純に access_token というキーのクッキーをクライアントが持っていない場合に「認証済みユーザではない」、つまり「ゲストであること」を確認するためのもの。例えば POST /auth/login や POST /auth/register、POST /auth/forgot-password などのエンドポイントで使用することになる。

```ts title="src/handlers/auth.ts"
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { ACCESS_TOKEN_KEY } from "../constants/auth.js";
import env from "../env.js";

export function auth(c: Context, next: Next) {
  const middleware = jwt({
    secret: env.ACCESS_TOKEN_SECRET,
    alg: "HS256",
    cookie: ACCESS_TOKEN_KEY,
  });
  return middleware(c, next);
}

export async function guest(c: Context, next: Next) {
  if (getCookie(c, ACCESS_TOKEN_KEY)) {
    throw new HTTPException(400, { message: "bad request" });
  }
  await next();
}
```

次に auth 関連のクエリを作成する。今回の例ではユーザ名、パスワードでログインする想定なので以下のような感じになる:

```ts title="src/routes/auth/auth.ts"
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../../db/client.js";
import { users } from "../../db/schema.js";

type UserSelect = typeof users.$inferSelect;

export async function getUser(data: {
  name: UserSelect["name"];
  password: UserSelect["password"];
}) {
  const query = await db
    .select({
      id: users.id,
      name: users.name,
      password: users.password,
    })
    .from(users)
    .where(eq(users.name, data.name))
    .limit(1)
    .get();

  if (query?.password) {
    if (await bcrypt.compare(data.password, query.password)) {
      return {
        id: query.id,
        name: query.name,
      };
    }
  }
}

export async function hasUser(data: {
  name: UserSelect["name"];
  password: UserSelect["password"];
}) {
  return !!(await getUser(data));
}
```

次に refresh_token の作成、失効のクエリを追加する。クライアントに発行した refresh_token をデータベースにて管理することによって、ユーザの状態をサーバ側でもある程度操作できるようにしておく。

```ts title="src/routes/auth/refresh-tokens.ts"
import { and, eq, gte } from "drizzle-orm";
import db from "../../db/client.js";
import { refreshTokens } from "../../db/schema.js";

type RefreshTokenSelect = typeof refreshTokens.$inferSelect;

export async function createRefreshToken(data: {
  userId: RefreshTokenSelect["userId"];
  token: RefreshTokenSelect["token"];
  expiresAt: RefreshTokenSelect["expiresAt"];
}) {
  await db.insert(refreshTokens).values(data);
}

export async function revokeRefreshToken(data: {
  userId: RefreshTokenSelect["userId"];
  token: RefreshTokenSelect["token"];
}) {
  const result = await db
    .select({ id: refreshTokens.id })
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.userId, data.userId),
        eq(refreshTokens.token, data.token),
        eq(refreshTokens.revoked, false),
        gte(refreshTokens.expiresAt, Math.floor(Date.now() / 1000)),
      ),
    )
    .get();

  if (result) {
    return await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, result.id));
  }
}
```

次にログイン時のユーザ入力のバリデーション処理を追加する。ユーザから受け取った user.name と user.password を検証し、失敗したらエラーメッセージを返す、成功したら user.id, user.name を返す、というようなことをやっている。この記事では [valibot](https://valibot.dev) を使用しているが、[zod](https://zod.dev) でもなんでも好きなものを使っていい。

```ts title="src/routes/auth/login/request.ts"
import * as v from "valibot";
import { getUser, hasUser } from "../auth.js";

export const loginJsonRequest = v.objectAsync({
  user: v.pipeAsync(
    v.object({
      name: v.string(),
      password: v.string(),
    }),
    v.checkAsync(
      async (input) => await hasUser(input),
      "these credentials do not match our records",
    ),
    v.transformAsync(async (input) => await getUser(input)),
  ),
});
```

最後に token をクライアントに発行する処理を追加する。access_token という有効期限の短い (数分) JWT と、refresh_token という有効期限が比較的長い (数日) JWT を hono/jwt の sign 関数で作成する。sub クレームにはユーザ ID の値を持たせておく。各 token の作成と同時に refresh_token のみ特定のユーザ ID とともにデータベースに保存する。あとは各 token のクッキーを作成しクライアントに発行する。

```ts title="src/utils/auth.ts"
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/auth.js";
import env from "../env.js";
import { createRefreshToken } from "../routes/auth/refresh-tokens.js";

export async function authenticate(c: Context, userId: number) {
  const now = Math.floor(Date.now() / 1000);

  const accessTokenExp = 60 * 15; // 15 minutes
  const accessToken = await sign(
    { sub: `${userId}`, exp: now + accessTokenExp },
    env.ACCESS_TOKEN_SECRET,
  );

  const refreshTokenExp = 60 * 60 * 24 * 30; // 30 days
  const refreshToken = await sign(
    { sub: `${userId}`, exp: now + refreshTokenExp },
    env.REFRESH_TOKEN_SECRET,
  );

  createRefreshToken({
    userId,
    token: refreshToken,
    expiresAt: now + refreshTokenExp,
  });

  setCookie(c, ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: env.SECURE_COOKIE === undefined,
    domain: env.COOKIE_DOMAIN ?? undefined,
    sameSite: "Lax",
    path: "/",
    maxAge: accessTokenExp,
  });

  setCookie(c, REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: env.SECURE_COOKIE === undefined,
    domain: env.COOKIE_DOMAIN ?? undefined,
    sameSite: "Lax",
    path: "/",
    maxAge: refreshTokenExp,
  });
}
```

クッキーの各属性についてはセキュリティ的に非常に重要だが、この記事では省略する。JWT 的にも気をつけないといけない箇所がいろいろあると思うが、とにかく見られてはいけないものを JWT に含めないこと、また JWT の有効期限を適切に設定することをまず意識する。

## 例外の管理

認証・認可、またはその他でエラーが発生した場合に、至る所で例外が投げられるので app.onError で一元管理する。これらのエラーは JSON 形式でクライアントに返すものなので、エラーメッセージの内容には気をつける。悪意のあるユーザのヒントになるような詳細なメッセージは含めないようにし、それらはログとしてサーバのみで確認できるようにしておく。

ちなみに、JWT の認証関連のエラーは 401 を返し、e.cause にその詳細が格納されている。開発時にはそのログを追いながら動作確認をしていく。

```ts title="src/handlers/error.ts"
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { JwtTokenInvalid } from "hono/utils/jwt/types";
import { customLogger } from "./logger.js";

const error = (e: Error, c: Context) => {
  if (e instanceof HTTPException) {
    if (e.status === 400) {
      return c.json({ message: e.message }, e.status);
    }
    if (e.status === 401) {
      if (e.cause) customLogger(`${e.cause}`);
      // if (e.cause) console.log(`${e.cause}`);
      return c.json({ message: "unauthorized" }, e.status);
    }
    if (e.status === 403) {
      return c.json({ message: "forbidden" }, e.status);
    }
    if (e.status === 404) {
      return c.json({ message: "not found" }, e.status);
    }
    if (e.status === 422) {
      return c.json({ message: e.cause }, e.status);
    }
  }

  if (e instanceof JwtTokenInvalid) {
    customLogger(e.message);
    return c.json({ message: "invalid token" }, 400);
  }

  return c.json({ message: e.message }, 500);
};

export default error;
```

error を application に適用する:

```ts title="src/app.ts"
import { Hono } from "hono";
import cors from "./handlers/cors.js";
import csrf from "./handlers/csrf.js";
import error from "./handlers/error.js";
import logger from "./handlers/logger.js";
import notFound from "./handlers/not-found.js";
import authApp from "./routes/auth/app.js";
import notesApp from "./routes/notes/app.js";

export const app = new Hono()
  .onError(error) // add
  .notFound(notFound)
  .use(logger)
  .use(cors)
  .use(csrf)
  .route("/auth", authApp)
  .route("/notes", notesApp);
```

## POST /auth/login ハンドラーの作成

では、準備が整ったのでルート・ハンドラーを作成していく。/auth/login ハンドラーでは、まずゲストユーザであることを確認する。次にユーザのログインに必要な情報を検証し、有効なら access_token と refresh_token を作成し、refresh_token をユーザ ID とともデータベースに保存する。また各 token をクッキーにセットしクライアントに発行する。

```ts title="src/routes/auth/login/handlers.ts"
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { guest } from "../../../handlers/auth.js";
import validator from "../../../handlers/validator.js";
import { authenticate } from "../../../utils/auth.js";
import { loginJsonRequest } from "./request.js";

const factory = createFactory();

const loginHandlers = factory.createHandlers(
  guest,
  validator("json", loginJsonRequest),

  async (c) => {
    const json = c.req.valid("json");
    if (!json.user) throw new HTTPException(400);
    await authenticate(c, json.user.id);
    return c.body(null, 204);
  },
);

export default loginHandlers;
```

## POST /auth/logout ハンドラーの作成

/auth/logout ハンドラーではログイン済みのユーザをログアウトさせる処理を書く。つまり最初にログイン済みのユーザであるかを auth ミドルウェア・ハンドラーで検証する。検証が通ったらクライアントが保持している refresh_token を元にデータベースに保存されているそのユーザの有効な refresh_token を無効にする。最後にクライアントが保持している auth 関連のクッキーを削除する。

```ts title="src/routes/auth/logout/handlers.ts"
import { deleteCookie, getCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { decode } from "hono/jwt";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../../../constants/auth.js";
import { auth } from "../../../handlers/auth.js";
import { revokeRefreshToken } from "../refresh-tokens.js";

const factory = createFactory();

const logoutHandlers = factory.createHandlers(auth, async (c) => {
  const token = getCookie(c, REFRESH_TOKEN_KEY) || "";
  const { payload } = decode(token);
  const userId = Number(payload.sub);

  const revokeRefreshTokenResult = await revokeRefreshToken({ userId, token });
  if (!revokeRefreshTokenResult) {
    throw new HTTPException(404);
  }

  deleteCookie(c, ACCESS_TOKEN_KEY, { path: "/" });
  deleteCookie(c, REFRESH_TOKEN_KEY, { path: "/" });

  return c.body(null, 204);
});

export default logoutHandlers;
```

## POST /notes ハンドラーの作成

では、例えば特定のログイン済みのユーザが新規に 1 件の note を作成する POST /notes ハンドラーを作成したとすると以下のような感じになる。

auth ミドルウェア・ハンドラーでログイン済みのユーザかを検証し、note の新規作成に必要な json リクエストかを検証する。検証が通ったらクライアントが保持している access_token からユーザ ID を取得して、note の新規作成に必要な検証済みデータとともに notes テーブルにデータを挿入する。

ここで、例えばクライアントが保持している access_token の内容を悪意のあるユーザが改竄したとしても、auth ミドルウェア・ハンドラーがその acceess_token を検証するため、例えば別のユーザになりすましてリソースの操作をするといったことはできない。

```ts title="src/routes/notes/create-note/handlers.ts"
import { createFactory } from "hono/factory";
import { auth } from "../../../handlers/auth.js";
import validator from "../../../handlers/validator.js";
import type { JWTPayload } from "../../../types/jwt-payload.js";
import { createNote } from "../note.js";
import { createNoteJsonRequest } from "./request.js";

const factory = createFactory<{ Variables: JWTPayload }>();

const createNoteHandlers = factory.createHandlers(
  auth,
  validator("json", createNoteJsonRequest),

  async (c) => {
    const payload = c.get("jwtPayload");
    const userId = Number(payload.sub);

    const json = c.req.valid("json");
    const note = await createNote({ userId, ...json });
    return c.json(note, 201);
  },
);

export default createNoteHandlers;
```

## POST /auth/refresh ハンドラーの作成

ユーザのログイン時にクライアントに発行する access_token と refresh_token には有効期限がある。この記事では access_token の有効期限は 15 分、refresh_token の有効期限は 30 日。auth ミドルウェア・ハンドラーでは access_token の検証のみがされるため、access_token の有効期限が切れると auth ミドルウェア・ハンドラーはその token を無効とし、クライアント側ではエラーが発生してログアウトしているような状態になる。

そこで、POST /auth/refresh ハンドラーを作成し、access_token の有効期限が切れた場合に関連する refresh_token ととも token の再発行をする。

処理の流れとしては、まずクライアントが保持している refresh_token を元にデータベースに保存されているそのユーザに関連する有効な refresh_token を無効にする。で、再度 access_token と refresh_token を新規に作成してクライアントに発行する。また、新規に作成された refresh_token はユーザ情報とともにデータベースに保存する。

つまり、アクティブユーザには 15 分毎に access_token と refresh_token を再発行しつづけログイン状態を保持するといった感じになる。

```ts title="src/routes/auth/refresh/handlers.ts"
import { getCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { decode } from "hono/jwt";
import { REFRESH_TOKEN_KEY } from "../../../constants/auth.js";
import { authenticate } from "../../../utils/auth.js";
import { revokeRefreshToken } from "../refresh-tokens.js";

const factory = createFactory();

const refreshHandlers = factory.createHandlers(async (c) => {
  const token = getCookie(c, REFRESH_TOKEN_KEY) || "";
  const { payload } = decode(token);
  const userId = Number(payload.sub);

  const revokeRefreshTokenResult = await revokeRefreshToken({ userId, token });
  if (!revokeRefreshTokenResult) {
    throw new HTTPException(404);
  }

  await authenticate(c, userId);

  return c.body(null, 204);
});

export default refreshHandlers;
```

## バックエンドの構成例

いくつかのミドルウェアやルート・ハンドラーは紹介しきれていないが、記事の流れに沿っていくと最終的には以下のような構成になる:

```ts title="src/routes/auth/app.ts"
import { Hono } from "hono";
import loginHandlers from "./login/handlers.js";
import logoutHandlers from "./logout/handlers.js";
import refreshHandlers from "./refresh/handlers.js";

const authApp = new Hono()
  .post("/login", ...loginHandlers)
  .post("/logout", ...logoutHandlers)
  .post("/refresh", ...refreshHandlers);

export default authApp;
```

```ts title="src/routes/notes/app.ts"
import { Hono } from "hono";
import createNoteHandlers from "./create-note/handlers.js";
import deleteNoteHandlers from "./delete-note/handlers.js";
import getNoteHandlers from "./get-note/handlers.js";
import getNotesHandlers from "./get-notes/handlers.js";
import updateNoteHandlers from "./update-note/handlers.js";

const notesApp = new Hono()
  .get("/", ...getNotesHandlers)
  .post("/", ...createNoteHandlers)
  .get("/:id", ...getNoteHandlers)
  .put("/:id", ...updateNoteHandlers)
  .delete("/:id", ...deleteNoteHandlers);

export default notesApp;
```

```ts title="src/app.ts"
import { Hono } from "hono";
import cors from "./handlers/cors.js";
import csrf from "./handlers/csrf.js";
import error from "./handlers/error.js";
import logger from "./handlers/logger.js";
import notFound from "./handlers/not-found.js";
import authApp from "./routes/auth/app.js";
import notesApp from "./routes/notes/app.js";

export const app = new Hono()
  .onError(error)
  .notFound(notFound)
  .use(logger)
  .use(cors)
  .use(csrf)
  .route("/auth", authApp)
  .route("/notes", notesApp);
```

## フロントエンドの簡単なコードの作成

このような構成の場合、フロントエンドでも少し工夫が必要になるので、簡単ではあるが説明とともにコードで示す。

fetch のラッパーみたいなものを用意して、バックエンドの各エンドポイントにリクエストする。401 が返ってきた場合 POST /auth/refresh にリクエストする。POST /auth/refresh のリクエストが成功した場合、access_token と refresh_token が再発行されるので、再度 401 が返ってきたエンドポイントにリクエストする。

バックエンドのログや Web ブラウザの console 画面のログを参考に動作確認をしていく。

以下は React での例:

```tsx title="/path/to/frontend/src/main.tsx"
/*
 * このファイルに記述されている console.log は
 * あくまで確認用なので最終的には取り除くこと
 */
import styles from "./main.module.css";

const API_URL = "http://localhost:8000";

async function http(input: `/${string}`, init?: RequestInit) {
  let res = await fetch(`${API_URL}${input}`, init);
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      res = await fetch(input, init);
    } else {
      console.log(await refreshRes.json());
    }
  }
  return res;
}

const getNotes = async () => {
  const data = await http("/notes", {
    credentials: "include",
  }).then((res) => res.json());
  console.log(data);
};

const getNote = async () => {
  const data = await http("/notes/1", {
    credentials: "include",
  }).then((response) => response.json());
  console.log(data);
};

const createNote = async () => {
  const { data } = await http("/notes", {
    credentials: "include",
  }).then((res) => res.json());

  await http("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: `t${(data ? data.length : 0) + 1}`,
      content: `c${(data ? data.length : 0) + 1}`,
    }),
  });
};

const deleteNote = async () => {
  const { data } = await http("/notes", {
    credentials: "include",
  }).then((res) => res.json());

  await http(`/notes/${data.length}`, {
    method: "DELETE",
    credentials: "include",
  });
};

const authLogin = async () => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      user: {
        name: "foo",
        password: "foofoofoo",
      },
    }),
  });
  if (!res.ok) {
    console.log(await res.json());
  }
};

const authLogout = async () => {
  await http("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
};

const Button = (props: { onClick: () => void; children: React.ReactNode }) => (
  <button type="button" className={styles.button} onClick={props.onClick}>
    {props.children}
  </button>
);

export const Main: React.FC = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>example</h1>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>/notes</h2>
        <Button onClick={getNotes}>GET /notes</Button>
        <Button onClick={createNote}>POST /notes</Button>
        <Button onClick={getNote}>GET /notes/:id</Button>
        <Button onClick={deleteNote}>DELETE /notes/:id</Button>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>/auth</h2>
        <Button onClick={authLogin}>POST /auth/login</Button>
        <Button onClick={authLogout}>POST /auth/logout</Button>
      </section>
    </main>
  );
};
```

## 従来のセッション認証との比較

この記事では hono/jwt を使って認証システムを構築してきたが、最終的には access_token はスレートレス、refresh_token はデータベースとも連帯しているのでステートフルな感じのものになった。

だとすれば、従来のセッション認証と比較して、hono/jwt を使った認証システムのメリットってなんだろう？という疑問が湧いてくる。

認証関連の処理でデータベースにアクセスする回数がアクティブユーザなら 15 分に 1 回程度になる、というのはメリットと言えるかもしれない。特定のユーザに発行した access_token を強制的に即時失効させるということはできない、というのはデメリット、token の再発行処理の影響がフロントエンドにも少し影響する、というのもデメリット。

雑にメリット・デメリットを挙げていっても従来のセッション認証よりも優れている点はあまり見られない。ただし、これは自分の知識・経験の不足であり、より JWT の特性をいかしたより良い方法があるはずで、それらはまた別の機会に記事にするかもしれない。

## まとめ

今回は、JWT の再入門的なノリで hono/jwt を使って認証システムを構築していった。上記で書かれている内容にはいくつかの不備があるかもしれないことに注意してほしい。

ただ、OAuth や OpenID Connect をより理解するための事前知識として、JWT を認証システム内で利用した場合、どういう感じになるんだろう？ということを確認したかった。結果的にはなんとも言えない中途半端なものになったが、それでも JWT の特性のほんの一部は理解できたかと思う。

## 関連リンク

- [Hono](https://hono.dev)
- [JWT Auth Middleware - Hono](https://hono.dev/docs/middleware/builtin/jwt)
- [JWT Authentication Helper - Hono](https://hono.dev/docs/helpers/jwt)
- [dcodeIO/bcrypt.js ･ GitHub](https://github.com/dcodeIO/bcrypt.js)
- [drizzle-team/drizzle-orm ･ GitHub](https://github.com/drizzle-team/drizzle-orm)

## 備考

Auth 関連のコードを扱うときはとくに、書いたコードだけではなく、フレームワーク自体のセキュリティやパッチバージョンのリリース情報などもしっかりと確認しておくことをおすすめする。もちろん Issues や Pull Requests の内容も確認しておくと尚良し。

- [Security Overview · honojs/hono](https://github.com/honojs/hono/security)
- [Releases · honojs/hono](https://github.com/honojs/hono/releases)
