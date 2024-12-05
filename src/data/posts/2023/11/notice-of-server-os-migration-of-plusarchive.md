---
title: PlusArchive のサーバ OS 移行のお知らせ
created_at: "2023-11-02"
last_updated: "2023-11-02"
tags: [info]
---

## はじめに

趣味で公開している [PlusArchive](https://plusarchive.com) のサーバ OS を CentOS から Ubuntu に移行します。移行期間中はサーバがダウンしており、アクセスできない状態になります。予めご了承ください。

## サーバ OS を移行する理由について

以下がサーバ OS を移行する大きな理由になります:

- CentOS 7 のサポート期間が 2024 年 06 月 30 日までであること
- CentOS 7 では Node.js 18.x が使えないこと

## サーバ OS とミドルウェアの比較

移行前:

- Sakura VPS CentOS 7
- MySQL 8.0.x
- nginx mainline
- PHP 8.1.x (php-fpm)
- Composer latest
- Node.js 16.x

移行後:

- Sakura VPS Ubuntu 22.04
- MySQL 8.0.x
- nginx mainline
- PHP 8.1.x (php-fpm)
- Composer latest
- Node.js 18.x

## サーバ OS の移行期間について

サーバ OS の移行期間は以下を予定しています。

- 2023 年 11 月 03 日 00 時頃から 2023 年 11 月 06 日 00 時頃まで

約 3 日間という長い移行期間ではありますが、プロジェクトの特徴や優先順位などを考慮して決定いたしました。ご理解のほどよろしくお願いいたします。

## PlusArchive の今後について

まず、サーバ OS の移行を丁寧に行い、終了させること。次に、サーバのメンテナンスをより行いやすくするための環境を整えること。

続いて、PHP 8.0 のサポートが 2023 年 11 月 26 日に終了するので、それに従い PHP のバージョンを 8.2 に上げること (PHP のバージョンは最新の安定版の 1 つ前のマイナーバージョンを使用するという個人的なルールがある) 。

また、Web フロントエンドについては Next.js の Pages Router を使用しているため、App Router への移行作業をすること。

以上が PlusArchive における技術的な今後の内容になります。Web フロントエンドについては個人的に熱の入る部分であるため、また別の機会に記事にする予定です。

## まとめ

なにはともあれ、今後とも [PlusArchive](https://plusarchive.com/) をよろしくお願いいたします。ささやかな日常の中で、良い音楽に出会うきっかけになれれば幸いです。

## 関連リンク

- [End dates are coming for CentOS Stream 8 and CentOS Linux 7 – Blog.CentOS.org](https://blog.centos.org/2023/04/end-dates-are-coming-for-centos-stream-8-and-centos-linux-7/)
- [Toolchain and Compiler Upgrades | Node.js 18 is now available! | Node.js](https://nodejs.org/en/blog/announcements/v18-release-announce#toolchain-and-compiler-upgrades)
- [Enterprise Open Source and Linux | Ubuntu](https://ubuntu.com/)
- [Ubuntu 22.04 — さくらの VPS マニュアル](https://manual.sakura.ad.jp/vps/os-packages/ubuntu-22.04.html)
- [PHP: Supported Versions](https://www.php.net/supported-versions.php)
- [Next.js 14 | Next.js](https://nextjs.org/blog/next-14)
