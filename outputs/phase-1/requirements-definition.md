<<<<<<< Updated upstream

# Phase 1: 要件定義書

||||||| Stash base

# Phase 1: 要件定義書 — UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

=======

# 要件定義書 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

<<<<<<< Updated upstream

## タスクID: UT-SKILL-WIZARD-W2-seq-03a

||||||| Stash base

## タスク概要

`SkillCategory`（英語識別子）をUI表示用の日本語ラベルにマッピングする定数・関数を `packages/shared/src/types/skillCreator.ts` に追加する。

## P50チェック結果（既実装状態確認）

```
grep -n "SKILL_CATEGORY_LABELS\|getSkillCategoryLabel" packages/shared/src/types/skillCreator.ts
→ No matches found（未実装を確認）
```

**判定**: 重複実装なし。本タスクで新規実装する。

## SkillCategory型定義（現状確認）

```typescript
// packages/shared/src/types/skillCreator.ts L948-L953
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";
```

5値が確認済み。

## 命名規則確認

| 対象                                                                           | パターン                                                        | 確認 |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---- | --- | --- | --- | ---------- |
| 定数（例: `WORKFLOW_MANIFEST_SCHEMA_VERSION`、`SKILL_CREATOR_ENGINE_VERSION`） | UPPER_SNAKE_CASE                                                | ✅   |
| 関数                                                                           | camelCase                                                       | ✅   |
|                                                                                |                                                                 |      |     |     |     | Stash base |
| 観点                                                                           | 結果                                                            |
| ----------------------------------------------                                 | --------------------------------------------------------------- |
| `selectedHealthStatus` の導出                                                  | `selectedProviderId` と `llmHealthStatus` から導出              |
| `buildMainlineExecutionAccessState()` の受け口                                 | `healthPolicy?: HealthPolicy` を受け取れる                      |
| `resolveHealthPolicy` の export                                                | `packages/shared/src/types/index.ts` から barrel export 済み    |
| `apiKeyDegraded` の扱い                                                        | hook 内の独自算出は削除対象、shared 側の型/関数では継続利用あり |

---

| 対象                                                                           | パターン         | 確認 |
| ------------------------------------------------------------------------------ | ---------------- | ---- |
| 定数（例: `WORKFLOW_MANIFEST_SCHEMA_VERSION`、`SKILL_CREATOR_ENGINE_VERSION`） | UPPER_SNAKE_CASE | ✅   |
| 関数                                                                           | camelCase        | ✅   |

=======

## P50チェック結果

| 確認項目                                         | 結果                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `validateCronExpression` シグネチャ              | `(value: string): string \| null` — オプション引数未追加 ✅              |
| JSDocに「semantic validationは行わない」コメント | 7行目・56行目に存在 ✅                                                   |
| 既存テストにセマンティック不正ケースなし         | SCV-01〜SCV-12に `"0 0 31 2 *"` 系なし ✅                                |
| `cron-parser` 未インストール                     | `apps/desktop/package.json` に `cron-parser` なし（`node-cron` のみ） ✅ |
| 関連ユーティリティの役割確認                     | `cronParser.ts`, `cronConverter.ts`, `cronHumanizer.ts` 存在確認 ✅      |

## 機能概要

`validateCronExpression` 関数に意味論的バリデーション（next-execution-time計算による到達可能性チェック）を追加する。

## 背景

現在の `validateCronExpression` は5フィールド構文チェックと各フィールドの値域のみを検証しており、`"0 0 31 2 *"`（2月31日）のような存在し得ない日付が通過してしまう。このようなスケジュールが設定された場合、条件が永久に満たされないため実行されない。

## 受け入れ基準

| AC番号 | 基準                                                                                   | 検証方法               |
| ------ | -------------------------------------------------------------------------------------- | ---------------------- |
| AC-1   | `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラー文字列を返す        | テスト PASS            |
| AC-2   | `validateCronExpression("0 0 * * *", { semantic: true })` 等の正常ケースは null を返す | テスト PASS            |
| AC-3   | 既存テスト SCV-01〜SCV-12 が全件 PASS                                                  | `pnpm test` PASS       |
| AC-4   | 意味論的不正ケースのテストが追加されカバレッジが向上                                   | テスト PASS + coverage |
| AC-5   | `scheduleConfigValidator.ts` のJSDocが更新されsemantic オプションの説明が含まれる      | コードレビュー         |

## スコープ

### 含む

- `scheduleConfigValidator.ts` への意味論的検証ロジック追加
- `ValidateCronOptions` インターフェース定義（`options?: { semantic?: boolean }`）
- `cron-parser` ライブラリの導入
- 既存テストへの意味論的不正ケースの追加

### 含まない

> > > > > > > Stashed changes

- バックエンド（`ScheduleStore` / `SkillScheduler`）の変更
- IPC チャンネルの変更
- UI の変更
- `cronParser.ts`、`cronConverter.ts`、`cronHumanizer.ts` の変更
- `validateTimezone` 関数の変更

<<<<<<< Updated upstream

- description / options / generationMode state の完全削除
- 全 template 条件分岐の除去
- inferSmartDefaults(formData) 純粋関数の実装（purpose小文字化、slack/github/notion大小文字不問検出）
- handleStep0Next() - formData→smartDefaults推論→Step 1遷移
- handleGenerate(method: "complete" | "skip") - generationLockRef + isGenerating で二重呼び出し防止
- handleQualityFeedback(satisfied: boolean) - trackEvent呼び出し
- handleRetry() - formData保持、answers/smartDefaults/skillPath等リセット、Step 0復帰
- STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"]
- Step 3 で skillPath を表示
- hasExternalIntegration / externalToolName を CompleteStep に接続

## 非機能要件

- TypeScript 型エラー 0件
- ESLint エラー 0件
- 全テスト Green（vitest）

## 実装状況（2026-04-11）

- 新state・ハンドラは実装済み
- 削除対象の generationMode / hasActivatedLlmMode / llmDescription state が残存
- Step 0 のテンプレート切替UIが残存
  ||||||| Stash base
  | ID | 要件 |
  | ---------------------------- | ------------------------------------------------------------------------------- | -------------------------- | --- | --- | --- | ---------- |
  | FR-1 | `SkillCategory` の全5値に対応する日本語ラベルを定数として定義する |
  | FR-2 | `SKILL_CATEGORY_LABELS` 定数をエクスポートする |
  | FR-3 | `getSkillCategoryLabel(category: SkillCategory): string` 関数をエクスポートする |
  | FR-4 | `Record<SkillCategory, string>` 型により型網羅性を保証する |
  | | | | | | | Stash base |
  | HealthPolicyInput フィールド | マッピング元 | 変換方法 |
  | ---------------------------- | ------------------------------ | -------------------------- |
  | `connectionStatus` | `selectedHealthStatus?.status` | `?? "disconnected"` で補完 |
  | `isApiKeyValid` | `credentials.apiKeyValid` | そのまま渡す |
  | `apiKeyDegraded` | 独自算出ロジックの代替 | `false` を渡す |
  | `isRateLimited` | hook 内に該当変数なし | `false` を渡す |
  | `lastHealthCheck` | `selectedHealthStatus` | `?? null` で補完 |

---

| ID   | 要件                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| FR-1 | `SkillCategory` の全5値に対応する日本語ラベルを定数として定義する               |
| FR-2 | `SKILL_CATEGORY_LABELS` 定数をエクスポートする                                  |
| FR-3 | `getSkillCategoryLabel(category: SkillCategory): string` 関数をエクスポートする |
| FR-4 | `Record<SkillCategory, string>` 型により型網羅性を保証する                      |

## マッピング定義

| SkillCategory          | 日本語ラベル                                                                 | 文字数                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --- | --- | --- | ---------- |
| `automation`           | 自動化                                                                       | 3                                                                                                             |
| `external-integration` | 外部連携                                                                     | 4                                                                                                             |
| `data-analysis`        | データ分析                                                                   | 5                                                                                                             |
| `code-support`         | コードサポート                                                               | 7                                                                                                             |
| `other`                | その他                                                                       | 3                                                                                                             |
|                        |                                                                              |                                                                                                               |     |     |     | Stash base |
| AC                     | 内容                                                                         | 確認方法                                                                                                      |
| ----                   | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| AC-1                   | `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている | hook で `resolveHealthPolicy` の import と呼び出しを確認                                                      |
| AC-2                   | `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている       | hook の呼び出し引数を確認                                                                                     |
| AC-3                   | `apiKeyDegraded` 独自算出ロジックが削除されている                            | hook 内の `const apiKeyDegraded = ...` が存在しないことを確認                                                 |
| AC-4                   | `@repo/shared/types` 経由でインポートしている                                | import 文を確認                                                                                               |
| AC-5                   | 既存ユニットテストが PASS する                                               | `pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts` |
| AC-6                   | TypeScript 型チェックが PASS する                                            | `pnpm --filter @repo/shared typecheck` / `pnpm --filter @repo/desktop typecheck`                              |

---

| SkillCategory          | 日本語ラベル   | 文字数 |
| ---------------------- | -------------- | ------ |
| `automation`           | 自動化         | 3      |
| `external-integration` | 外部連携       | 4      |
| `data-analysis`        | データ分析     | 5      |
| `code-support`         | コードサポート | 7      |
| `other`                | その他         | 3      |

## 非機能要件

- UIコンポーネントから参照可能なエクスポート
- `@repo/shared/types/skillCreator` subpath export に閉じる（root barrel に広げない）

## タスク分類

- 種別: **実装タスク / 非UIタスク / NON_VISUAL**
- スケール: small
- # UI実装: なし（Phase 11は手動テスト中心）

## 変更対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 修正     |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 修正     |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 修正     |
| `apps/desktop/package.json`                                             | 依存追加 |

> > > > > > > Stashed changes
