# Phase 4: テスト設計書

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 4          |

---

## テスト対象

| コンポーネント    | Atomic Design | 責務                             |
| ----------------- | ------------- | -------------------------------- |
| SkillAnalysisView | organism      | 分析ビュー全体の統合・状態管理   |
| ScoreDisplay      | molecule      | 総合スコア・カテゴリ別スコア表示 |
| SuggestionList    | molecule      | 改善提案リスト・選択操作         |
| RiskPanel         | molecule      | リスク情報一覧表示               |

## テスト環境方針

| 項目          | 方針                                                    | 根拠             |
| ------------- | ------------------------------------------------------- | ---------------- |
| DOM環境       | happy-dom                                               | vitest.config.ts |
| ユーザー操作  | `fireEvent` のみ使用（`userEvent` 禁止）                | P39対策          |
| 非同期操作    | `await act(async () => { fireEvent.click(el) })`        | P39対策          |
| テスト実行    | `cd apps/desktop && pnpm vitest run`                    | P40対策          |
| CSS変数テスト | `variantStyles` Record定数をexport/importして検証       | P47対策          |
| Storeセレクタ | Zustand不使用（useStateベースのローカル状態で完結）     | P31対策（不要）  |
| IPC APIモック | `window.electronAPI.skill` を beforeEach でセットアップ | 既存パターン準拠 |
| テスト独立性  | beforeEach でモックリセット、テスト間で状態非共有       | P9対策           |

## モック戦略

### IPC APIモック

`createMockSkillAPI()` ヘルパーで `window.electronAPI.skill` の全メソッドをモック化する。
テスト対象メソッドは以下の3つ。

- `analyze(skillName: string): Promise<SkillAnalysis>`
- `applyImprovements(skillName: string, suggestions: Suggestion[]): Promise<ImprovementResult>`
- `autoImprove(skillName: string): Promise<ImprovementResult>`

`setupMockElectronAPI(mockSkillAPI)` で `window.electronAPI` への注入を行う。
`Object.defineProperty` を使用し、`writable: true, configurable: true` で上書き可能に設定する。

### モック定義ファイル

| ファイルパス                             | 責務                                               |
| ---------------------------------------- | -------------------------------------------------- |
| `__tests__/helpers/mock-electron-api.ts` | `createMockSkillAPI` + `setupMockElectronAPI` 定義 |
| `__tests__/helpers/test-data-factory.ts` | テストデータファクトリ関数群                       |

### テストデータファクトリ

以下のファクトリ関数を `__tests__/helpers/test-data-factory.ts` に定義する。

| ファクトリ関数                            | 生成型               | デフォルト値の特徴                                           |
| ----------------------------------------- | -------------------- | ------------------------------------------------------------ |
| `createMockCategory(overrides)`           | `AnalysisCategory`   | name="Code Quality", score=75, issues=["未使用の変数が存在"] |
| `createMockSuggestion(overrides)`         | `Suggestion`         | type="prompt", priority="medium", autoFixable=false          |
| `createMockRisk(overrides)`               | `Risk`               | category="security", level="medium", mitigation付き          |
| `createMockAppliedImprovement(overrides)` | `AppliedImprovement` | result="success"                                             |
| `createMockAnalysis(overrides)`           | `SkillAnalysis`      | overallScore=72, 3カテゴリ, 3提案, 2リスク                   |
| `createMockImprovementResult(overrides)`  | `ImprovementResult`  | applied=1件, skipped/errors=空                               |
| `createHighScoreAnalysis()`               | `SkillAnalysis`      | overallScore=85, 全カテゴリ80以上, 提案/リスクなし           |
| `createLowScoreAnalysis()`                | `SkillAnalysis`      | overallScore=35, 4リスク(critical/high/medium/low)           |

全ファクトリ関数は `Partial<T>` の `overrides` パラメータを受け取り、スプレッド演算子でデフォルト値を上書きする設計。

## テスト数サマリー

| テストファイル                         | テストケース数 |
| -------------------------------------- | -------------- |
| `__tests__/SkillAnalysisView.test.tsx` | 12             |
| `__tests__/ScoreDisplay.test.tsx`      | 8              |
| `__tests__/SuggestionList.test.tsx`    | 9              |
| `__tests__/RiskPanel.test.tsx`         | 7              |
| **合計**                               | **36**         |

## 要件マッピング

| 機能要件 | 対応テストケース                                                  |
| -------- | ----------------------------------------------------------------- |
| FR-1     | SkillAnalysisView #1（ローディング）, #2（API呼び出し）           |
| FR-2     | SkillAnalysisView #3（結果表示）, ScoreDisplay全件, RiskPanel全件 |
| FR-3     | SkillAnalysisView #6（トグル）, #7（適用）, SuggestionList全件    |
| FR-4     | SkillAnalysisView #8（全自動改善）                                |
| FR-5     | SkillAnalysisView #4（エラー表示）, #5（再試行）                  |
| NFR-2    | ScoreDisplay #8（ARIA属性）                                       |

## Pitfall対策マッピング

| Pitfall | 対策内容                                                                      | テストでの反映                                                                                     |
| ------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| P9      | beforeEachでモックリセット、テスト間で状態非共有                              | 全テストファイルで `vi.clearAllMocks()` を beforeEach に設定                                       |
| P39     | happy-dom環境では `fireEvent` のみ使用、`userEvent` 禁止                      | `userEvent` の import なし。非同期は `await act(async () => {})` 使用                              |
| P40     | `cd apps/desktop && pnpm vitest run` で実行                                   | vitest.config.ts の happy-dom 設定が正しく読み込まれる                                             |
| P47     | variantStyles Record定数をコンポーネントからexport → テスト側でimportして検証 | ScoreDisplay: `scoreVariantStyles`, SuggestionList: `priorityStyles`, RiskPanel: `riskLevelStyles` |
