# 未タスク指示書: UT-DX-VITE-ALIAS-SHARED-IMPORT-001

## メタ情報

```yaml
issue_number: 1707
```

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-DX-VITE-ALIAS-SHARED-IMPORT-001                                                |
| 由来         | TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 Phase 12 unassigned-task-detection |
| ステータス   | completed（TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 で吸収済み）                |
| 優先度       | low                                                                               |
| 分類         | DX改善                                                                            |
| 対応時期     | 2026-03-31 対応完了                                                               |
| 作成日       | 2026-03-29                                                                        |
| 関連ファイル | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`      |

---

## 概要

テストファイルにおける `@repo/shared` の値インポートが `vitest.config.ts` の `resolve.alias` で解決できるか調査・対応する。

現在 `governance-bundle.test.ts` では cross-layer parity テスト（観点 5: disclosure separation）において `@repo/shared/src/ipc/channels` エイリアスの代わりに、以下の7階層の相対パスによるワークアラウンドを使用している。

```ts
// 現状（governance-bundle.test.ts L225）
await import("../../../../../../../packages/shared/src/ipc/channels");
```

---

## なぜ必要か（Why）

### 背景

`tsconfig.json` には `@repo/shared/src/ipc/channels` へのパスエイリアスが登録されている:

```json
// apps/desktop/tsconfig.json の paths セクション
"@repo/shared/src/ipc/channels": [
  "../../packages/shared/src/ipc/channels.ts"
]
```

しかし `vitest.config.ts` の `resolve.alias` には対応するエントリが存在しない:

```ts
// apps/desktop/vitest.config.ts の resolve.alias（現状）
resolve: {
  alias: {
    "@": resolve(__dirname, "src"),
    "@renderer": resolve(__dirname, "src/renderer"),
    "@main": resolve(__dirname, "src/main"),
    "@anthropic-ai/claude-agent-sdk": resolve(
      __dirname,
      "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
    ),
  },
},
```

`vite-tsconfig-paths` プラグインは静的インポート（`import { ... } from "..."` 構文）では `tsconfig.json` の `paths` を参照してエイリアスを解決できる。しかし動的 `import()` 式では vite バンドラーの制約により解決できないケースがあり、TASK-UT-SDK-07 の cross-layer parity テスト実装時に相対パスへのフォールバックを余儀なくされた。

### 動機

- 7階層の相対パス（`../../../../../../../packages/shared/src/ipc/channels`）はファイル移動・リネーム時に壊れやすく、メンテナンスコストが高い
- 同じ `channels.ts` のインポートが2種類の記法（エイリアス vs 相対パス）で混在することで、コードの可読性・一貫性が損なわれる
- `vitest.config.ts` への `resolve.alias` 追加は他のテストファイルにも横断的に恩恵をもたらす

---

## 何を達成するか（What）

1. `vitest.config.ts` の `resolve.alias` に `@repo/shared/src/ipc/channels` を追加する（または `tsconfigPaths` による解決が動的 `import()` でも機能することを確認する）
2. `governance-bundle.test.ts` の相対パスを `@repo/shared/src/ipc/channels` エイリアスに置き換える
3. 同様の相対パスワークアラウンドが他のテストファイルに存在しないか調査し、あれば同様に修正する

---

## どのように実行するか（How）

### 調査方針

1. `vite-tsconfig-paths` の動的 `import()` 解決制約の有無を最新バージョンで再確認する
2. `vitest.config.ts` に `resolve.alias` エントリを追加してテストが通るか検証する
3. 通らない場合は `vi.mock`／`vi.importActual` を使ったモック経由の静的インポートパターンへのリファクタリングを検討する

### 実装方針（解決策A: alias 追加）

```ts
// vitest.config.ts に追加する候補エントリ
resolve: {
  alias: {
    "@": resolve(__dirname, "src"),
    "@renderer": resolve(__dirname, "src/renderer"),
    "@main": resolve(__dirname, "src/main"),
    "@repo/shared/src/ipc/channels": resolve(
      __dirname,
      "../../packages/shared/src/ipc/channels.ts",
    ),
    // 必要に応じて @repo/shared/* 全体をカバーするパターンも検討
    "@anthropic-ai/claude-agent-sdk": resolve(
      __dirname,
      "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
    ),
  },
},
```

---

## 実行手順

1. `vite-tsconfig-paths` プラグインのバージョンと動的 `import()` 解決サポート状況を確認する

   ```bash
   pnpm --filter @repo/desktop list vite-tsconfig-paths
   ```

2. `governance-bundle.test.ts` の相対パスを一時的にエイリアスに変更してテストが通るか確認する

   ```ts
   // 変更前
   await import("../../../../../../../packages/shared/src/ipc/channels");
   // 変更後（試験的）
   await import("@repo/shared/src/ipc/channels");
   ```

3. テストが失敗する場合、`vitest.config.ts` の `resolve.alias` に追記して再試験する

4. 解決策A（alias 追加）が有効なら `vitest.config.ts` を更新し、テストファイルの相対パスをエイリアスに置き換える

5. 解決策Aが無効（vite 制約が依然として存在）な場合、動的 `import()` を静的インポートに書き換えるリファクタリングを検討する

   ```ts
   // 動的 import() を静的インポートに変換する例
   import {
     APPROVAL_CHANNELS,
     EXECUTION_CHANNELS,
   } from "@repo/shared/src/ipc/channels";
   ```

6. 同様の相対パスワークアラウンドが他のテストファイルに存在するか調査する

   ```bash
   grep -rn "packages/shared/src/ipc" apps/desktop/src --include="*.test.ts"
   ```

7. `pnpm --filter @repo/desktop test` でフルスイートが PASS することを確認する

---

## 完了条件

- [x] `governance-bundle.test.ts` の7階層相対パスが `@repo/shared/src/ipc/channels` エイリアスに置き換えられていること
- [x] `vitest.config.ts` の `resolve.alias` が `@repo/shared/src/ipc/channels` を正しく解決できること
- [x] `pnpm exec vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts src/main/services/runtime/__tests__/governance-bundle.test.ts` が PASS すること
- [x] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [x] current wave で解消済みのため、本指示書が completed area へ移管されていること

## 完了メモ

- `apps/desktop/vitest.config.ts` に `@repo/shared/src/ipc/channels` alias を追加
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` の dynamic import を alias 化
- 本課題は `TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001` の Phase 1-12 で吸収済み

---

## 開発知見・苦戦箇所

TASK-UT-SDK-07 Phase 12 の cross-layer parity テスト（`governance-bundle.test.ts` の「disclosure は approval と別責務」観点）では、`shared` パッケージの `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` 定数と desktop preload の `IPC_CHANNELS` 定数が同一チャネル名を使用していることをランタイムで検証するテストを実装した。

このテストで `@repo/shared/src/ipc/channels` エイリアスを動的 `import()` 内で使用しようとしたところ、vite バンドラーの動的インポート解決の制約により `@repo/shared` エイリアスが解決されなかった。`tsconfigPaths` プラグインは静的インポート文では期待通りに機能するが、`await import(...)` の動的インポートでは tsconfig の `paths` マッピングが適用されないケースが存在する。

回避策として、プロジェクトルートからの絶対的な相対パス（`../../../../../../../packages/shared/src/ipc/channels`）を直接使用する方法を採用した。この方法はテスト実行環境（Vitest のワーキングディレクトリがプロジェクトルートであること）に依存しており、ファイル移動に対して脆弱である。

なお同じ `channels.ts` のファイルは `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts` では静的インポート文で `@repo/shared/src/ipc/channels` エイリアスを使用しており正常に解決されている。これは静的 vs 動的インポートの差が問題であることを示唆している。

---

## 関連仕様書・参照

- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` - 問題のある動的インポート（L225）
- `apps/desktop/vitest.config.ts` - 現在の `resolve.alias` 設定
- `apps/desktop/tsconfig.json` - `@repo/shared/src/ipc/channels` パスエイリアス定義
- `packages/shared/src/ipc/channels.ts` - インポート対象の実体ファイル
- `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts` - 静的インポートで `@repo/shared/src/ipc/channels` が動作している比較例
- `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md` - Vitest alias 自動同期関連タスク（参考）
