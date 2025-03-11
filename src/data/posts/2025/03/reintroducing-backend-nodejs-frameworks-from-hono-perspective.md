---
title: Hono 視点からから見たバックエンドの Node.js Framework 再入門
created_at: "2025-03-11"
last_updated: "2025-03-11"
tags: [hono, node]
---

## はじめに

ここ数ヶ月に渡って Hono に影響され Node.js の Framework を改めていろいろと触ったのでそのアウトプットをしていく。

## 環境

Runtime & Package Manager:

- Node.js 22.x
- pnpm 10.x

Framework:

- Hono 4.x
- Express 5.x
- Fastify 5.x
- NestJS 11.x

Database & ORM:

- SQLite 3.x
- Prisma 6.x
- TypeORM 0.x
- Drizzle ORM 0.x

## 作ったもの

とりあえず Hono で REST API っぽいものを作りたかったので作った。アプリケーション的にはシンプルなメモ帳みたいなもの。

- [jamband/kagari](https://github.com/jamband/kagari)

api 側は Hono をメインとしたバックエンド、web 側は Vite と TypeScript を使用したフロントエンド、という構成になっている。

web 側のフロントエンドは差し替え前提な作りにして、Hono RPC の検証もしたかったので、あえて Monorepo 構成になっている。あえてね。

## データベースについて

Rails や Laravel などを触ってきた人からすると、Node.js の Framework を触ってまずきついな思うところが、データベースの ORM どうすんの問題。数年前なら TypeORM か Prisma みたいな感じだったが、どちらを選んでも何か不安だった。

案の定、TypeORM はマイナーバージョンで大幅な Breaking Change が発生したり、その後メンテナーが不在になったりした。現在は組織の再編成をして再スタートというフェーズみたいだが、今後どうなるかはよくわからない。

一方 Prisma は数年前よりかは少し安定しているように見えるが、[From Rust to TypeScript 問題](https://www.prisma.io/blog/from-rust-to-typescript-a-new-chapter-for-prisma-orm) が控えており、とりあえずそれが解決されるまではなんともいえない状況になっている。

また、今回作った [jamband/kagari](https://github.com/jamband/kagari) では、自分が触ったことのなかった [Drizzle ORM](https://orm.drizzle.team) を検証も兼ねて使っている。TypeORM や Prisma と比べると後発な ORM なので気にはなっているが、まだ 0.x ということもあり Breaking Change が頻繁に発生している。

このように ORM だけをみても、枯れているものは依然としてなさそうだった。

## テストについて

これもデータベースに関連するが、例えば結合テストを書きたい場合、Laravel だと [RefreshDatabase](https://laravel.com/docs/11.x/database-testing#resetting-the-database-after-each-test) というものがあって、簡単にテスト毎にテストデータをリフレッシュしてくれる。

Node.js の Framework だと、そもそもデータベースが Framework の管理外みたいな感じになっているので、RefreshDatabase みたいなものを自分たちで用意しないといけない。もちろんデータベースのマイグレーション機能も Framework 側には備わっていないので、各 ORM が提供するマイグレーションツールを使って、自分たちでデータベースを絡めたテスト環境を作っていかなくてはいけない。

その他には、Express にはそもそもテストに関連する公式ドキュメントがなく、コミュニティ側で提供されていたり、[NestJS の公式ドキュメントのテストページ](https://docs.nestjs.com/fundamentals/testing) は @nestjs/testing を使ったモック前提の解説記事みたいになっていて、正直何のテストをしているのかよくわからない内容になっている。

これだと初学者は何のテストを書けばいいかわからない以前に、どのようにテストを書けばいいかわからないだろうし、テストを書いたとしても意味のあるテストが書けているかどうかは疑わしい。

そもそもどの Framework を使っていたとしても質の高いテストコードというものを書くのは難しいが、テストが書きにくいというのは実コードにも影響を与えるわけで、その基盤が整っていないのは非常に苦しい。

そんな中でも Hono と Fastify は結合テストが書きやすく感じた。Hono は app.request で、Fastify は fastify.inject で簡単に Request/Response のテストが書ける。

- [Testing - Hono](https://hono.dev/docs/guides/testing)
- [Testing - Fastify](https://fastify.dev/docs/latest/Guides/Testing/)

## データの検証について

バックエンドはデータベースなどと密接に結びついているため、外部から送られてくるデータはすべて検証しないといけない。Node.js の Framework には基本的に外部から送られてくるデータを検証するような機能をコアが持っていないので、これも何かしらのパッケージをインストールして使うような形になっている。

Express だと [express-validator](https://express-validator.github.io/docs/)、NestJS だと [class-validator](https://github.com/typestack/class-validator)、Fastify だと [Ajv](https://ajv.js.org) がデフォルトみたいな扱いになっている。特にこれを使えという縛りはなく、差し替え可能ではあるが、では何を使おうかとなると意外と迷うことになる。

枯れてそうなのは Ajv か？でも [Zod](https://zod.dev) や [Valibot](https://valibot.dev) がある今 JSON Schema ってきつくないか？でも Zod や Valibot だってこれまでと同じように「新しい何か」に置き換わる可能性だってある。そうやっていろいろと考え出すと結局答えは出ないので、「とりあえず [Standard Schema](https://standardschema.dev) にも準拠しているし、みんな触ったことのある Zod でいきましょう」とかいう安直な答えになったりする。

## そして Hono

Hono はそれ自体バックエンドの Framework におさまらない何かを持っているが、後発だけあって「今の環境」に最適化された良い感じの作りになっている。他の Framework だとコードを書いているとどうしてもきついところがあるが、Hono だとそれがほとんどない。

また、Node.js の Framework の「この何か足りない...問題」を埋めてくれるように、豊富な [Middleware](https://github.com/honojs/middleware) も用意されている。もちろん外部パッケージを別途導入しないといけないのは他の Framework と変わらないが、導入から割当て、そしてコードを書くまでの流れがスムーズで心地良い。

強いて問題を挙げるならば [Hono PRC](https://hono.dev/docs/guides/rpc) の IDE performance 問題というのがある。これは簡単にいうと「ルートが多くなるとエディターの補完が遅くなる」というもので、解決方法がいくつかあってすべて試したがどれも一長一短であり、ベストな解決方法がわからなかった。[jamband/kagari](https://github.com/jamband/kagari) ではグループ毎に Hono Client を生成するようにしている。

あと、ルートハンドラー内で例外を投げるとエラー時のレスポンスの型が生成されない問題もある。これは例えば、エラーハンドリングを Hono.onError で一元管理している場合などには Hono RPC の恩恵を十分に受けられないことを意味する。

このように、現状の Hono RPC にはいくつかの問題とルールみたいなものがあるので、既存のプロジェクトに合わないのなら無理に使わなくてもいいような気がする。[Fastify でいうところの Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#serialization) みたいな機能が追加されたり、また別の何かが追加されたときに再度検証してみたいと思う。

## まとめ

Node.js の Framework に full-stack を求めてはいけない。枯れる前に廃れていくものが多い中、それでも品質や相性などを見極めて、つなぎ合わせ上手な Micro Framework 上にそれらを配置する。

依存は慎重に、そして控えめに。

それでも大変であるのならば、それはそういうもんなんだろう。

とりあえず、枯れた ORM が欲しい。

## 関連リンク

Framework:

- [Hono](https://hono.dev)
- [Express](https://expressjs.com)
- [Fastify](https://fastify.dev)
- [NestJS](https://nestjs.com)

ORM:

- [Prisma](https://www.prisma.io)
- [TypeORM](https://typeorm.io)
- [Drizzle ORM](https://orm.drizzle.team)

Schema validation:

- [Ajv](https://ajv.js.org)
- [Zod](https://zod.dev)
- [Valibot](https://valibot.dev)
- [Standard Schema](https://standardschema.dev)

Demo:

- [jamband/kagari](https://github.com/jamband/kagari)
