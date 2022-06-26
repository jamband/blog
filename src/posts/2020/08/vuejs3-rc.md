---
title: Vue.js 3 のリリース候補版を触ってみた
created_at: "2020-08-24"
last_updated: "2020-08-24"
tags:
    - vue
---

## はじめに

もうそろそろ Vue.js 3 の安定版がリリースされそうだが、その前にリリース候補版を触ってみた。メインは Composition API。あと Vue.js 3 用の Vue Router と Vue Test Utils をちょっと。その他はほとんど触っていない。

## 環境

- Vue.js v3.0.0-rc.9
- Vue Router v4.0.0-beta.7
- Vue Test Utils v2.0.0-beta.3

## Composition API について

Vue 2.x の Single File Components の書き方というのは Options API を使ったものらしく、 Vue.js 3 ではそれに加えて新たに Composition API というものが実装された。この Composition API の旨味は Single File Components において、今までどうしても分割して管理するのが難しかったロジック部分をより良い感じに分割・管理できるようになるところらしい。

今回 Vue.js 3 の Composition API の雰囲気を掴むために簡単な Web サイトを作成したわけだが、まぁ簡単な Web サイトなので当たり前だが、結果としてこの Composition API の旨味部分は全然感じられず、なんか React Hooks の Vue.js 版かな？くらいの感想しかなかった。

また、実際問題この Composition API を使って膨大なロジック部分をどのように分割・管理すればいいのかのベストプラクティスみたいなものがまだ見えてこないので、各々が探り探りでやっていき、時間とともに何か提案されていくんだろう、というのが現状のように思う。

## Vue Router について

Vue Router も Composition API の実装により useRoute()  とか useRouter() とかが用意されていて、Router 関連の処理を書く場合に利用できるになっている。

今までだと (Vue.js 2.x):

```
this.$route.name
```

みたいなところが Vue.js 3 の Composition API を使用している場合、以下のように書くことができる:

```js
<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    const route = useRoute()
    console.log(route.name)

    return {
      // ...
    }
  }
</script>
```

使うものだけ引っ張ってくる系はファイルを見ると何に依存しているのかがぱっと見でわかるので個人的には好み。

## Vue Test Utils について

Composition API が実装されたことでわりと重要になってくるのがテスト周りで (テストがより書きやすくなるため) 、Vue.js 3 用の Vue Test Utils も触ってみたが、Vue.js 2.x 用のやつと若干の変更はあるものの、Vue Router のスタブがまだ実装されていないみたいで (2.x 系でいう [RouterLinkStub](https://vue-test-utils.vuejs.org/api/components/))、まだ時期尚早かなと思い、深く掘り下げるのはやめた。

## まとめ

そんなこんなで Vue.js 3 のリリース候補版で作成した簡単な Web サイトがあるので興味のある人は見てほしい。Vue.js 3 で Bootstrap 5 のあれやこれやをただ動作確認しただけのサイトだが、Composition API の雰囲気はコードから読み取れるはず。

- ~~QuietBoatz~~
- ~~Github jamband/quiet-boatz~~

上記のリポジトリは現在存在しません (長期的なメンテナンスが難しいと判断したため削除した) 。Nuxt.js 3 がリリースされそうな頃合いにまた何か記事を書こうかなと思う。
