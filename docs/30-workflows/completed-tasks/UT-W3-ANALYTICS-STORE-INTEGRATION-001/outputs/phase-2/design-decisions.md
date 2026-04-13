# Phase 2: 設計決定書

## 実行日時

2026-04-13

## AC 対応表

| AC番号 | 設計での対応                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| AC-1   | `trackSkillStart` / `trackSkillComplete` / `trackSkillError` の各アクションが `analyticsAdapter.send()` を直接呼び出す |
| AC-2   | Zustand `create()` を使用し `useAnalyticsStore` としてエクスポートする                                                 |
| AC-3   | `analyticsSlice` は `trackEvent` を import しない。依存グラフに明記                                                    |
| AC-4   | `analyticsAdapter` を `vi.mock()` でモック可能な設計。型は `any` を使用しない                                          |

## 設計方針

### action-first 方針

- `analyticsSlice` は state を持たず、アクションのみを公開する
- middleware（subscribeWithSelector, immer）は採用しない
- `analyticsAdapter.send()` を各アクション内で直接呼び出す

### 型定義方針

- `SkillAnalyticsEvent` は `packages/shared/src/types/skill-analytics.ts` に追加する
- `SkillUsageEvent`（既存）は変更しない
- `SkillAnalyticsEvent` は renderer-side の新型定義

### 責務境界（analyticsSlice が何をしないか）

| しないこと                | 理由                                       |
| ------------------------- | ------------------------------------------ |
| state の永続化（persist） | analytics 送信は fire-and-forget で良い    |
| イベントのバッファリング  | バッファリングは `analyticsAdapter` の責務 |
| `trackEvent` の呼び出し   | UI 計装との循環依存を避ける（AC-3）        |
| エラー時のリトライ        | リトライは `analyticsAdapter` の責務       |
| UI 状態への反映           | 初回スコープ外                             |

### テスト戦略（テスタビリティ確保）

- `analyticsAdapter` は `vi.mock("../../utils/analyticsAdapter")` でモック可能
- モックで `send` の呼び出し回数・引数・イベント名を検証する
- テスト間の状態汚染なし（action-only なので state リセット不要）

## 公開アクション仕様

| アクション名         | 引数型                                    | 戻り値 | 内部処理                                                                               |
| -------------------- | ----------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `trackSkillStart`    | `skillId: string`                         | `void` | `SkillAnalyticsEvent` を組み立て `analyticsAdapter.send("skill_start", ...)` を呼ぶ    |
| `trackSkillComplete` | `skillId: string, duration: number`       | `void` | `SkillAnalyticsEvent` を組み立て `analyticsAdapter.send("skill_complete", ...)` を呼ぶ |
| `trackSkillError`    | `skillId: string, error: string \| Error` | `void` | `SkillAnalyticsEvent` を組み立て `analyticsAdapter.send("skill_error", ...)` を呼ぶ    |

## エラーハンドリング方針

- `analyticsAdapter.send()` が例外をスローした場合、アクションは例外を外に伝播させない
- `try/catch` で囲み、エラーは console.warn に留める（UI を壊さない）
