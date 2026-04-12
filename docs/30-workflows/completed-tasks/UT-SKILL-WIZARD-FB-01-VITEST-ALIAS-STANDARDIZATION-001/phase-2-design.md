# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 2                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 1                                                               |
| 後続Phase  | Phase 3                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

`packages/shared/vitest.config.ts` への `resolve.alias` 追加の設計を確定し、
実装方針を明確化する。

## 背景

Phase 1 で確認した通り、vitest.config.ts に `@repo/shared` resolve alias が不足していた。
本 Phase では設計を確定し、実装差分と検証コマンドを定義する。

## Concern分析

本タスクは **1 concern**（vitest設定変更のみ）のため、単一設計書に集約する。

| Concern | 内容                          | 影響ファイル                       |
| ------- | ----------------------------- | ---------------------------------- |
| C-01    | vitest resolve.alias 設定追加 | `packages/shared/vitest.config.ts` |

## 設計方針

### 修正前（問題のある設定）

```typescript
// packages/shared/vitest.config.ts - resolve.alias なし
export default defineConfig({
  test: {
    environment: "node",
  },
});
```

### 修正後（標準設定）

```typescript
// packages/shared/vitest.config.ts - @repo/shared alias 追加
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/shared": path.resolve(__dirname, "./index.ts"),
    },
  },
  test: {
    environment: "node",
    // 既存設定を維持
  },
});
```

### 設計根拠

| 決定事項      | 選択肢A                                    | 選択肢B                         | 採用    |
| ------------- | ------------------------------------------ | ------------------------------- | ------- |
| aliasの解決先 | `./index.ts`（バレルエクスポート）         | `./src/index.ts`（直接ソース）  | 選択肢A |
| パス解決方法  | `path.resolve(__dirname, ...)`             | `new URL(..., import.meta.url)` | 選択肢A |
| 設定場所      | `vitest.config.ts` の `resolve` セクション | `test.alias` セクション         | 選択肢A |

**採用理由**: `packages/shared/index.ts` が公開エントリポイントのため、alias は index.ts を指すべき。
`path.resolve` は CJS 互換性が高く、既存の vitest.config.ts パターンと一致する。

## 変更対象ファイル

| ファイル                           | 変更種別 | 変更内容                       |
| ---------------------------------- | -------- | ------------------------------ |
| `packages/shared/vitest.config.ts` | 修正     | `resolve.alias` ブロックを追加 |

## 検証コマンド設計

```bash
# 1. resolve.alias 設定の存在確認
grep -n "resolve" packages/shared/vitest.config.ts

# 2. @repo/shared インポートを含むテストの実行
pnpm --filter @repo/shared test

# 3. 全テストが PASS することの確認
pnpm --filter @repo/shared test --reporter=verbose
```

## テスト戦略

| テスト種別       | 目的                                           | コマンド                          |
| ---------------- | ---------------------------------------------- | --------------------------------- |
| 単体（設定確認） | resolve.alias が正しく設定されているか確認     | `grep` コマンドによる静的チェック |
| 統合（実行確認） | @repo/shared import を含むテストが PASS するか | `pnpm --filter @repo/shared test` |
| 回帰             | 既存テストへの影響がないか確認                 | `pnpm --filter @repo/shared test` |

## DI境界・状態所有権

本タスクは設定ファイル変更のみのため、DI境界・状態所有権の変更はなし。

## リスク評価

| リスク                           | 確率 | 影響 | 対策                                        |
| -------------------------------- | ---- | ---- | ------------------------------------------- |
| alias 解決先が間違い（404）      | 低   | 高   | `packages/shared/index.ts` の存在を事前確認 |
| 既存テストの並列実行設定への影響 | 低   | 中   | pool: forks 設定は変更しないことを明示      |
| CI環境での `__dirname` 解決失敗  | 低   | 中   | `path.resolve` の CJS 互換性を確認済み      |

## 参照資料

| 資料名       | パス                                         | 用途           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |

## 実行手順

1. Phase 1 の要件定義書・受け入れ基準を確認する
2. vitest.config.ts の修正差分を設計する
3. 検証コマンドを定義する
4. 設計書を outputs/phase-2/ に出力する

## 統合テスト連携

- 修正後の vitest.config.ts で `pnpm --filter @repo/shared test` が PASS することを確認
- ESLint フックによる変換後のテストファイルでも import が解決されることを確認

## 多角的チェック観点

| 観点             | 確認内容                                                              |
| ---------------- | --------------------------------------------------------------------- |
| 責務境界         | vitest.config.ts の変更範囲を最小限（resolve ブロック追加のみ）に限定 |
| 既存設定との整合 | pool: forks や coverage 設定を変更しないこと                          |
| 将来拡張性       | 他の @repo/\* パッケージも同様の設定が必要な場合の拡張容易性          |

## 成果物

| 成果物         | パス                                    | 説明                     |
| -------------- | --------------------------------------- | ------------------------ |
| 設計書         | `outputs/phase-2/design-document.md`    | resolve.alias 設計の詳細 |
| vitest設定計画 | `outputs/phase-2/vitest-config-plan.md` | 設定変更計画             |
| テスト戦略     | `outputs/phase-2/test-strategy.md`      | 検証コマンドと戦略       |

## 完了条件

- [x] 実行タスクで定義した成果物を全件作成
- [x] 矛盾がないことを確認
- [x] 漏れがないことを確認
- [x] 整合性が取れていることを確認
- [x] 依存関係が取れていることを確認
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1 成果物の確認（完了）
2. 設計方針の決定（完了）
3. 変更ファイル一覧の確定（完了）
4. 検証コマンド設計（完了）
5. 成果物出力（完了）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 3: 設計レビューゲート
