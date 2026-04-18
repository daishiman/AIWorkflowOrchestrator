# Phase 1: 要件定義

## メタ情報

| 項目           | 値                                                |
| -------------- | ------------------------------------------------- |
| ドキュメントID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001-PH1 |
| 作成日         | 2026-04-18                                        |
| ステータス     | PASS                                              |
| 担当フェーズ   | Phase 1（要件定義）                               |
| 後続フェーズ   | Phase 2（設計）→ Phase 3（設計レビュー）          |

## P50 チェック（実装状況確認）

本タスクは仕様書作成時点で実装が既に完了している。以下の通り P50 チェックを実施した。

### 実装確認

**ファイル**: `packages/shared/src/types/skillCreator.ts`

- 行 948-953: `SkillCategory` 型（union type）が定義済み
- 行 960-966: `SKILL_CATEGORY_LABELS` 定数が `as const satisfies Record<SkillCategory, string>` パターンで実装済み
- 行 973-975: `getSkillCategoryLabel(category: SkillCategory): string` 関数が実装済み
- 両シンボルとも `export` キーワード付きで公開済み

### テスト確認

**ファイル**: `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

- 行 178 以降: `describe("SKILL_CATEGORY_LABELS", ...)` ブロックで全 5 カテゴリのラベル値を検証
- 行 205 以降: 全 `SkillCategory` 値の網羅チェックテストが存在
- 行 222 以降: `describe("getSkillCategoryLabel", ...)` ブロックで関数の動作を検証
- 行 245 以降: エッジケース（空文字・undefined チェック）も実装済み

### P50 判定

**PASS** — 実装・テストともに完了済み。Phase 5 は「差分確認・回帰テスト」モードとなる（本仕様書では Phase 3 までを対象とする）。

---

## 1. タスク概要

`SkillCategory`（英語識別子）を UI 表示用の日本語ラベルに変換するマッピング定数・関数を `packages/shared` に提供する。

Wave 1 以降の UI コンポーネントはこのマッピングを参照してカテゴリ名を日本語表示する。実装を `packages/shared` に集約することで、コンポーネント側がラベル文字列をハードコードするアンチパターンを防ぐ。

## 2. 背景

### 課題

スキルウィザード再設計（skill-wizard-redesign）において、Step 0 のカテゴリ選択 UI は `SkillCategory` 値（英語）をそのままユーザーに見せることができない。

- 表示用ラベルがコンポーネントごとにバラバラに定義されると、カテゴリ追加時の対応漏れが生じる
- 英語識別子と日本語ラベルの対応を型システムで保証する仕組みが必要

### 解決方針

`packages/shared/src/types/skillCreator.ts` に `SKILL_CATEGORY_LABELS` および `getSkillCategoryLabel` を定義し、`@repo/shared/types/skillCreator` サブパスからエクスポートする。

## 3. スコープ

### 含む

| 対象                    | 内容                                                   |
| ----------------------- | ------------------------------------------------------ |
| `SKILL_CATEGORY_LABELS` | `SkillCategory` → 日本語ラベルのマッピング定数         |
| `getSkillCategoryLabel` | カテゴリ値を受け取り日本語ラベルを返す関数             |
| ユニットテスト          | 全カテゴリのラベル定義・関数の動作・エッジケースの検証 |

### 含まない

| 対象                                 | 理由                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| UIコンポーネントの実装               | 後続 Wave のコンポーネントタスクで対応                   |
| `SkillCategory` 型定義の変更         | UT-SKILL-WIZARD-W0-seq-01 で確定済み                     |
| root `@repo/shared` へのエクスポート | `skill.ts` の既存 `SkillCategory` との衝突回避のため禁止 |

## 4. 受け入れ条件（AC-1〜AC-3）

### AC-1: 全カテゴリのラベル定義

`SkillCategory` の全 5 値（`"automation"` / `"external-integration"` / `"data-analysis"` / `"code-support"` / `"other"`）それぞれに対応する日本語ラベルが `SKILL_CATEGORY_LABELS` に定義されていること。

**検証方法**: `Object.keys(SKILL_CATEGORY_LABELS)` の要素数が 5 であり、各キーに非空文字列の値が存在することをユニットテストで確認。

**判定**: PASS

### AC-2: エクスポートと参照可能性

`SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel` が `packages/shared/src/types/skillCreator.ts` からエクスポートされ、`@repo/shared/types/skillCreator` サブパスを通じて UI コンポーネントから import 可能であること。

**検証方法**: `packages/shared/package.json` の `./types/skillCreator` export 定義と `packages/shared/tsup.config.ts` の entry に `src/types/skillCreator.ts` が含まれていることを確認し、テストファイルで `import { SKILL_CATEGORY_LABELS, getSkillCategoryLabel } from "../skillCreator"` が解決できることを確認。

**判定**: PASS

### AC-3: 型安全な網羅性チェック

`as const satisfies Record<SkillCategory, string>` パターンにより、将来 `SkillCategory` に新しい値が追加された場合、`SKILL_CATEGORY_LABELS` にエントリを追加しないと TypeScript のコンパイルエラーが発生すること。

**検証方法**: TypeScript の型チェック（`pnpm --filter @repo/shared typecheck`）が通ることで間接的に確認。

**判定**: PASS

## 5. 関連ファイル

| ファイル                                                          | 役割                                             |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                       | 実装本体（行 948-975）                           |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | ユニットテスト                                   |
| `packages/shared/package.json`                                    | `@repo/shared/types/skillCreator` の export 定義 |
| `packages/shared/tsup.config.ts`                                  | `skillCreator.ts` の build entry 定義            |

## 6. 依存関係

| 種別     | タスク / 定義                      | 方向             |
| -------- | ---------------------------------- | ---------------- |
| 上流依存 | UT-SKILL-WIZARD-W0-seq-01          | このタスクが依存 |
| 下流依存 | Wave 1 UIコンポーネントタスク群    | このタスクに依存 |
| 型依存   | `SkillCategory`（skillCreator.ts） | このタスクが参照 |

## 7. 完了条件チェックリスト

| チェック項目                                              | 状態 |
| --------------------------------------------------------- | ---- |
| `SKILL_CATEGORY_LABELS` が 5 エントリ定義済み             | PASS |
| `getSkillCategoryLabel` がエクスポート済み                | PASS |
| `as const satisfies Record<SkillCategory, string>` を使用 | PASS |
| 全カテゴリのユニットテストが存在する                      | PASS |
| TypeScript 型チェックが通る                               | PASS |
| `@repo/shared/types/skillCreator` からのみ公開            | PASS |
