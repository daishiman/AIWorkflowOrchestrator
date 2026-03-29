# 実装ガイド: SkillExecutor/sdkMessageNormalizer 型ガード重複解消

## Part 1: 初学者・中学生レベルの説明

### なぜこの変更が必要だったのか

想像してみてください。学校に2人の翻訳係がいます。Aさんは英語を日本語に訳す係、Bさんは英語をフランス語に訳す係です。2人とも翻訳を始める前に、まず「これは本当に英語の文章か？」をチェックしています。

- 紙が白紙じゃないか確認する
- 文字が書いてあるか確認する
- 英語の文章っぽいか確認する

この「事前チェック」は2人とも全く同じことをしていました。もしチェックの方法を変える必要が出たら、2人それぞれに伝えなければいけません。片方に伝え忘れると、問題が起きます。

そこで、この「事前チェック」だけを共通のマニュアルにまとめました。2人はそのマニュアルを見てチェックし、その後はそれぞれの翻訳作業（日本語訳・フランス語訳）を独立して行います。

### この変更で何が変わったのか

- 「事前チェック」のやり方が1箇所にまとまった → 変更が必要になっても1箇所直すだけでOK
- 翻訳作業そのものは変わっていない → 使っている人から見ると何も変わらない

## Part 2: 開発者・技術者レベルの説明

### 概要

`SkillExecutor.ts` と `sdkMessageNormalizer.ts` の2箇所に分散していた SDK メッセージ前処理（`unknown → Record<string, unknown>` 判定 + `type` フィールド読取り）を `sdkMessageUtils.ts` の共通 helper に集約した。

### API シグネチャ

```typescript
// apps/desktop/src/main/services/runtime/sdkMessageUtils.ts

/** SDK 生メッセージ候補を表す最小 record */
export type SdkMessageRecord = Record<string, unknown>;

/**
 * unknown を SDK メッセージ候補 record に正規化する。
 * null / undefined / 非オブジェクト / 配列は除外する。
 */
export function asSdkMessageRecord(message: unknown): SdkMessageRecord | null;

/**
 * SDK メッセージ候補 record から type フィールドを安全に取り出す。
 * type が string でない場合は undefined を返す。
 */
export function getSdkMessageType(
  message: SdkMessageRecord,
): string | undefined;
```

### 使用例

```typescript
// SkillExecutor.ts での使用
import {
  asSdkMessageRecord,
  getSdkMessageType,
} from "../runtime/sdkMessageUtils";

const msg = asSdkMessageRecord(rawMessage);
if (!msg) return null;

const msgType = getSdkMessageType(msg);
if (msgType === "text" && typeof msg.content === "string") {
  // lane 固有のテキスト処理
}
```

```typescript
// sdkMessageNormalizer.ts での使用
import { asSdkMessageRecord, getSdkMessageType } from "./sdkMessageUtils";

const msg = asSdkMessageRecord(rawMessage);
if (!msg) return buildErrorEvent("Invalid SDK message", context);

const msgType = getSdkMessageType(msg);
switch (msgType) {
  case "system":
    return normalizeSystemMessage(msg, context);
  // ...
}
```

### エッジケース・エラーハンドリング

| 入力               | `asSdkMessageRecord` の戻り値 | 備考                                      |
| ------------------ | ----------------------------- | ----------------------------------------- |
| `null`             | `null`                        | `== null` で null と undefined を一括処理 |
| `undefined`        | `null`                        |                                           |
| `"string"`         | `null`                        | `typeof !== "object"` で除外              |
| `42`               | `null`                        |                                           |
| `[1, 2, 3]`        | `null`                        | `Array.isArray()` で配列を除外            |
| `Symbol("x")`      | `null`                        |                                           |
| `{}`               | `SdkMessageRecord`            | 空 object も通す                          |
| `new Date()`       | `SdkMessageRecord`            | 配列以外の object は許可される            |
| `{ type: "text" }` | `SdkMessageRecord`            |                                           |

| 入力                   | `getSdkMessageType` の戻り値 |
| ---------------------- | ---------------------------- |
| `{ type: "text" }`     | `"text"`                     |
| `{ type: 123 }`        | `undefined`                  |
| `{ type: null }`       | `undefined`                  |
| `{ content: "hello" }` | `undefined`                  |
| `{ type: "" }`         | `""`（空文字も string）      |

### 変更対象ファイル

| ファイル                                                                   | 変更種別 | 内容                                           |
| -------------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`                | 新規     | 共通 helper 2関数 + 1型                        |
| `apps/desktop/src/main/services/runtime/__tests__/sdkMessageUtils.test.ts` | 新規     | 21テストケース（カバレッジ100%）               |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                    | 修正     | SDKMessage/isValidSDKMessage 削除 → helper利用 |
| `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`           | 修正     | インライン前処理 → helper利用                  |

### 設定可能なパラメータと定数

| 項目                  | 値   | 備考                                                 |
| --------------------- | ---- | ---------------------------------------------------- |
| 設定可能パラメータ    | なし | helper は固定ロジックのみを持つ                      |
| 新規定数              | なし | 本タスクで追加された設定値・定数はない               |
| public interface 変更 | なし | `SkillStreamMessage` / `SkillCreatorSdkEvent` は不変 |

### 品質メトリクス

- 実装 wave 記録: 66件 全 PASS（新規21 + 回帰45）
- 実装 wave 記録: カバレッジ Line/Branch/Function/Statement 全て 100%
- 現ワークツリー再確認: `pnpm typecheck` PASS
- 現ワークツリー再確認: `pnpm lint` 0 errors / 10 warnings
- 現ワークツリー再確認: `pnpm vitest run ...` は `esbuild` platform mismatch で blocked
