---
title: Deno で CLI ツールを作成する
created_at: "2025-03-15"
last_updated: "2025-03-15"
tags: [deno, node]
---

## はじめに

Deno で簡単な CLI ツールを作成する。同じような環境を Node.js でも構築し Deno との比較をする。

## 環境

- Deno 2.x
- Node.js 22.x

## Deno で CLI ツールを作成する

例えば Hex 値を RGB 値に変換するものを作る。以下のような感じ:

```
./hex2rgb.ts #13111a
19 17 26
```

これを Deno で作っていく:

```
cd /path/to/somewhere
deno init hex2rgb
cd hex2rgb
```

deno.json を編集する:

```json title="deno.json"
{
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check .",
    "test": "deno test --allow-run"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@1"
  }
}
```

deno run check でコードのフォーマット、リント、型チェックをすべてチェックする。deno run test でテストファイルを実行する。[JSR](https://jsr.io) で @std/assert の追加をしているが、それ以外はすべて最初から備わっている。これが Deno の魅力の一つ。

コマンドを作成する:

```ts title="hex2rgb.ts"
#!/usr/bin/env -S deno

const args = Deno.args;

// 入力値の数が正しくない場合はエラーメッセージを出力して終了する
if (args.length !== 1) {
  console.error("enter hex code");
  Deno.exit(1);
}

// -h でヘルプを出力して終了する
if (args.length === 1 && args[0] === "-h") {
  console.log("description:");
  console.log("  hex to rgb\n");
  console.log("command usage:");
  console.log("  ./hex2rgb.ts <hex>|<#hex>");
  Deno.exit(0);
}

// 入力値から先頭の # を取り除いたものを一時的に hex 値として保持する
let hex = args[0].replace(/^#/, "");

// 入力値に無効な値が含まれていた場合はエラーメッセージを出力して終了する
if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
  console.error("invalid hex code");
  Deno.exit(1);
}

// hex 値が 3 桁の場合は 6 桁に変換する (e.g. abc to aabbcc)
if (hex.length === 3) {
  hex = [...hex].map((c) => `${c}${c}`).join("");
}

// rgb 値を出力して終了する
console.log(
  "%s %s %s",
  Number.parseInt(hex.substring(0, 2), 16), // r
  Number.parseInt(hex.substring(2, 4), 16), // g
  Number.parseInt(hex.substring(4, 6), 16), // b
);
Deno.exit(0);
```

hex2rgb.ts に実行権限を与える:

```
chmod +x hex2rgb.ts
```

これで以下のような感じで実行することができる:

```
./hex2rgb.ts #eee
238 238 238
```

.ts が邪魔な場合はファイル名を hex2rgb.ts から hex2rgb にリネームして ext=js オプションを与えてあげればいい:

```ts title="hex2rgb"
#!/usr/bin/env -S deno --ext=js
// ...
```

これでよりそれっぽくなる:

```
./hex2rgb #eee
238 238 238
```

ただし、今回は hex2rgb.ts というファイル名を使って話を進めていく。

## Deno でテストを書く

入力値を与えて、その結果 (終了コード、標準エラー出力、標準出力) をテストしていく:

```ts title="hex2rgb_test.ts"
import { assertEquals, assertStringIncludes } from "jsr:@std/assert";

const path = "./hex2rgb.ts";

function decode(input: BufferSource) {
  return new TextDecoder().decode(input).trim();
}

Deno.test("has no args", () => {
  const output = new Deno.Command(path).outputSync();
  assertEquals(output.code, 1);
  assertEquals(decode(output.stdout), "");
  assertEquals(decode(output.stderr), "enter hex code");
});

Deno.test("output help", () => {
  const output = new Deno.Command(path, { args: ["-h"] }).outputSync();
  assertEquals(output.code, 0);
  assertEquals(decode(output.stderr), "");
  assertStringIncludes(decode(output.stdout), "description:");
});

Deno.test("invalid hex code", () => {
  const testData = [
    { input: "a" },
    { input: "aa" },
    { input: "aaaa" },
    { input: "aaaaa" },
    { input: "bcdefg" },
    { input: "aaa#" },
  ];
  for (const data of testData) {
    const output = new Deno.Command(path, { args: [data.input] }).outputSync();
    assertEquals(output.code, 1);
    assertEquals(decode(output.stderr), "invalid hex code");
    assertEquals(decode(output.stdout), "");
  }
});

Deno.test("valid hex code", () => {
  const testData = [
    { input: "000", output: "0 0 0" },
    { input: "fff", output: "255 255 255" },
    { input: "#000", output: "0 0 0" },
    { input: "#fff", output: "255 255 255" },
    { input: "13111a", output: "19 17 26" },
    { input: "#13111a", output: "19 17 26" },
  ];
  for (const data of testData) {
    const output = new Deno.Command(path, { args: [data.input] }).outputSync();
    assertEquals(output.code, 0);
    assertEquals(decode(output.stderr), "");
    assertEquals(decode(output.stdout), data.output);
  }
});
```

テストを実行する:

```
deno run test
```

## Node.js で CLI ツールを作成する

Deno とできるだけ同じような環境を構築しつつ、同じような CLI ツールを作成していく:

```
cd /path/to/somewhere
mkdir hex2rgb
cd hex2rgb
npm init
npm i -ED @biomejs/biome @types/node typescript
```

package.json を編集する:

```json title="package.json"
{
  "type": "module",
  "private": true,
  "scripts": {
    "check": "tsc --noEmit && biome check .",
    "test": "node --test --experimental-strip-types"
  },
  "devDependencies": {
    "@biomejs/biome": "1.9.4",
    "@types/node": "22.13.10",
    "typescript": "5.8.2"
  }
}
```

npm run check で TypeScript の tsc を使って型チェック、Biome を使ってコードのフォーマット、リントなどをチェックする。npm run test でテストファイルを実行する。

Biome と TypeScript の設定は以下:

```json title="biome.json"
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "error"
      }
    }
  }
}
```

```jsonc title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "skipLibCheck": true,
    "strict": true,
    "exactOptionalPropertyTypes": true,
    // ...
  }
}
```

Deno と比較すると開発環境を構築する手間が少し発生するが、慣れたらそこまできつくはないと思う。

コマンドを作成する:

```ts title="hex2rgb.ts"
#!/usr/bin/env node --experimental-strip-types

const args = process.argv.slice(2);

// 入力値の数が正しくない場合はエラーメッセージを出力して終了する
if (args.length !== 1) {
  console.error("enter hex code");
  process.exit(1);
}
// -h でヘルプを出力して終了する
if (args.length === 1 && args[0] === "-h") {
  console.log("description:");
  console.log("  hex to rgb");
  console.log("");
  console.log("command usage:");
  console.log("  ./hex2rgb.ts <hex>|<#hex>");
  process.exit(0);
}

// 入力値から先頭の # を取り除いたものを一時的に hex 値として保持する
let hex = args[0].replace(/^#/, "");

// 入力値に無効な値が含まれていた場合はエラーメッセージを出力して終了する
if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
  console.error("invalid hex code");
  process.exit(1);
}

// hex 値が 3 桁の場合は 6 桁に変換する (e.g. abc to aabbcc)
if (hex.length === 3) {
  hex = [...hex].map((c) => `${c}${c}`).join("");
}

// rgb 値を出力する
console.log(
  "%s %s %s",
  Number.parseInt(hex.substring(0, 2), 16), // r
  Number.parseInt(hex.substring(2, 4), 16), // g
  Number.parseInt(hex.substring(4, 6), 16), // b
);
process.exit(0);
```

hex2rgb.ts に実行権限を与える:

```
chmod +x hex2rgb.ts
```

hex2rgb.ts を実行する:

```
./hex2rgb.ts #abc
170 187 204
```

## Node.js でテストを書く

Deno で書いたテストと同じようなテストを Node.js で書く:

```ts title="hex2rgb.test.ts"
import { match, strictEqual } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const path = "./hex2rgb.ts";

test("has no args", () => {
  const output = spawnSync(path, { encoding: "utf-8" });
  strictEqual(output.status, 1);
  strictEqual(output.stderr.trim(), "enter hex code");
  strictEqual(output.stdout, "");
});

test("output help", () => {
  const output = spawnSync(path, ["-h"], { encoding: "utf-8" });
  strictEqual(output.status, 0);
  strictEqual(output.stderr, "");
  match(output.stdout, /^description:/);
});

test("invalid hex code", () => {
  const testData = [
    { input: "a" },
    { input: "aa" },
    { input: "aaaa" },
    { input: "aaaaa" },
    { input: "bcdefg" },
    { input: "aaa#" },
  ];
  for (const data of testData) {
    const output = spawnSync(path, [data.input], { encoding: "utf-8" });
    strictEqual(output.status, 1);
    strictEqual(output.stderr.trim(), "invalid hex code");
    strictEqual(output.stdout, "");
  }
});

test("valid hex code", () => {
  const testData = [
    { input: "000", output: "0 0 0" },
    { input: "fff", output: "255 255 255" },
    { input: "#000", output: "0 0 0" },
    { input: "#fff", output: "255 255 255" },
    { input: "13111a", output: "19 17 26" },
    { input: "#13111a", output: "19 17 26" },
  ];
  for (const data of testData) {
    const output = spawnSync(path, [data.input], { encoding: "utf-8" });
    strictEqual(output.status, 0);
    strictEqual(output.stderr, "");
    strictEqual(output.stdout.trim(), data.output);
  }
});
```

テストを実行する:

```
npm run test
```

## まとめ

簡単な CLI ツールの作成に Deno がいいよということで Node.js と比較して検証してみた。結果としては、そこまで Node.js もきつくないということと、Deno はいろいろと最初からあって便利、ということだった。

配布の手軽さ、あとセキュリティ面、コンパイルなども Deno の魅力だと思うので、そこらへんもまた探っていきたい。

## 関連リンク

- [Deno ･ Blog ･ Build a Cross-Platform CLI with Deno in 5 minutes](https://deno.com/blog/build-cross-platform-cli)
- [Deno ･ examples ･ Executable scripts](https://docs.deno.com/examples/hashbang_tutorial/)
- [Deno ･ Testing](https://docs.deno.com/runtime/fundamentals/testing/)
- [Deno ･ Security and permissions](https://docs.deno.com/runtime/fundamentals/security/)
- [Node.js ･ Test runner](https://nodejs.org/api/test.html)
- [Node.js ･ process.exit](https://nodejs.org/api/process.html#processexitcode)
- [Node.js ･ util.parseArgs](https://nodejs.org/api/util.html#utilparseargsconfig)
- [Node.js ･ util.styleText](https://nodejs.org/api/util.html#utilstyletextformat-text-options)
