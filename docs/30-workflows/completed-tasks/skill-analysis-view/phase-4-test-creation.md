# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目             | 値                                          |
| ---------------- | ------------------------------------------- |
| Phase            | 4                                           |
| Phase名          | テスト作成                                  |
| 機能名           | SkillAnalysisView（スキル分析ビュー）       |
| タスクID         | TASK-10A-B                                  |
| 前提Phase        | Phase 3（設計レビュー PASS）                |
| 後続Phase        | Phase 5（実装）                             |
| 作成日           | 2026-03-02                                  |
| テスト環境       | Vitest + @testing-library/react + happy-dom |
| テストファイル数 | 4                                           |

## 目的

Phase 2 の設計に基づき、SkillAnalysisView とサブコンポーネント（ScoreDisplay, SuggestionList, RiskPanel）のテストコードをテストファーストで作成する。全テストが Red 状態（実装未済のため失敗）であることを確認し、Phase 5 の実装目標を明確にする。

## 実行タスク

- テスト設計方針確定: happy-dom、fireEvent、モック戦略を固定する
- 共通ユーティリティ作成: IPC モックとテストデータファクトリを整備する
- SkillAnalysisView テスト作成: 表示・操作・状態遷移のテストケースを作る
- ScoreDisplay テスト作成: スコア閾値と表示アクセシビリティを検証する
- SuggestionList テスト作成: 選択操作と優先度表示のテストケースを作る
- RiskPanel テスト作成: リスクレベル表示と空状態表示を検証する
- Red状態確認: 全テストが実装前に失敗することを確認する

## 参照資料

| 資料名                         | パス                                                                              | 説明                            |
| ------------------------------ | --------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義               | `phase-1-requirements.md`                                                         | FR/NFR/受け入れ基準             |
| Phase 2 設計                   | `phase-2-design.md`                                                               | コンポーネント設計・Props定義   |
| Phase 3 設計レビュー           | `phase-3-design-review.md`                                                        | 設計レビュー結果                |
| バックエンド型定義             | `packages/shared/src/types/skill-improver.ts`                                     | SkillAnalysis/Suggestion/Risk型 |
| IPCチャネル定義                | `apps/desktop/src/preload/channels.ts`                                            | SKILL_ANALYZE/IMPROVE/OPTIMIZE  |
| Preload API                    | `apps/desktop/src/preload/skill-api.ts`                                           | safeInvokeUnwrapパターン        |
| テスト品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準                  |
| コンポーネントテストパターン   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト方針                      |
| アクセシビリティテスト         | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | WCAG観点テスト項目              |
| P39: happy-dom userEvent非互換 | `.claude/rules/06-known-pitfalls.md#P39`                                          | fireEvent使用必須               |
| P40: テスト実行ディレクトリ    | `.claude/rules/06-known-pitfalls.md#P40`                                          | cd apps/desktop && pnpm vitest  |
| P47: CSS変数テストアサーション | `.claude/rules/06-known-pitfalls.md#P47`                                          | variantStyles Record定数        |

## 実行手順

### Task 1: テスト設計方針

#### 1-1: テスト環境方針

| 項目          | 方針                                                    | 根拠             |
| ------------- | ------------------------------------------------------- | ---------------- |
| DOM環境       | happy-dom                                               | vitest.config.ts |
| ユーザー操作  | `fireEvent` のみ使用（`userEvent` 禁止）                | P39対策          |
| 非同期操作    | `await act(async () => { fireEvent.click(el) })`        | P39対策          |
| テスト実行    | `cd apps/desktop && pnpm vitest run`                    | P40対策          |
| CSS変数テスト | `variantStyles` Record定数をexport/importして検証       | P47対策          |
| Storeセレクタ | 個別セレクタをモック（合成Hook使用禁止）                | P31対策          |
| IPC APIモック | `window.electronAPI.skill` を beforeEach でセットアップ | 既存パターン準拠 |
| タイマー      | `vi.useFakeTimers()` + `advanceTimersByTime`            | P13対策          |

#### 1-2: テストファイル一覧

| テストファイル                         | 対象コンポーネント | テストケース数 |
| -------------------------------------- | ------------------ | -------------- |
| `__tests__/SkillAnalysisView.test.tsx` | SkillAnalysisView  | 12             |
| `__tests__/ScoreDisplay.test.tsx`      | ScoreDisplay       | 8              |
| `__tests__/SuggestionList.test.tsx`    | SuggestionList     | 9              |
| `__tests__/RiskPanel.test.tsx`         | RiskPanel          | 7              |
| **合計**                               |                    | **36**         |

### Task 2: 共通テストユーティリティ

#### 2-1: IPC APIモック定義

テストファイル共通で使用する IPC API モックを定義する。

```typescript
// __tests__/helpers/mock-electron-api.ts
import { vi } from "vitest";

export const createMockSkillAPI = () => ({
  analyze: vi.fn(),
  applyImprovements: vi.fn(),
  autoImprove: vi.fn(),
});

export const setupMockElectronAPI = (
  mockSkillAPI: ReturnType<typeof createMockSkillAPI>,
) => {
  (
    window as unknown as {
      electronAPI: { skill: Record<string, unknown> };
    }
  ).electronAPI = {
    skill: mockSkillAPI,
  };
};
```

#### 2-2: テストデータファクトリ

```typescript
// __tests__/helpers/test-data-factory.ts
import type {
  SkillAnalysis,
  AnalysisCategory,
  Suggestion,
  Risk,
  ImprovementResult,
} from "@repo/shared/types/skill-improver";

export const createMockCategory = (
  overrides?: Partial<AnalysisCategory>,
): AnalysisCategory => ({
  name: "Code Quality",
  score: 75,
  details: "コード品質の分析結果",
  issues: ["未使用の変数が存在"],
  ...overrides,
});

export const createMockSuggestion = (
  overrides?: Partial<Suggestion>,
): Suggestion => ({
  type: "prompt",
  priority: "medium",
  description: "プロンプトの明確化を推奨",
  autoFixable: false,
  ...overrides,
});

export const createMockRisk = (overrides?: Partial<Risk>): Risk => ({
  category: "security",
  level: "medium",
  description: "外部入力のバリデーション不足",
  impact: "不正入力による予期しない動作",
  mitigation: "入力値のサニタイズを追加する",
  ...overrides,
});

export const createMockAnalysis = (
  overrides?: Partial<SkillAnalysis>,
): SkillAnalysis => ({
  skillName: "test-skill",
  overallScore: 72,
  categories: [
    createMockCategory({ name: "Code Quality", score: 80 }),
    createMockCategory({ name: "Security", score: 60 }),
    createMockCategory({ name: "Documentation", score: 75 }),
  ],
  suggestions: [
    createMockSuggestion({ priority: "high", autoFixable: true }),
    createMockSuggestion({ priority: "medium", autoFixable: false }),
    createMockSuggestion({ priority: "low", autoFixable: true }),
  ],
  risks: [
    createMockRisk({ level: "high" }),
    createMockRisk({ level: "medium" }),
  ],
  ...overrides,
});

export const createMockImprovementResult = (
  overrides?: Partial<ImprovementResult>,
): ImprovementResult => ({
  appliedImprovements: [],
  skippedSuggestions: [],
  errors: [],
  ...overrides,
});
```

### Task 3: SkillAnalysisView テストケース

ファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

| No  | テストケース名                   | 検証内容                                                          |
| --- | -------------------------------- | ----------------------------------------------------------------- |
| 1   | 初期ローディング状態を表示する   | マウント時にローディングスピナーが表示される                      |
| 2   | 分析APIを自動呼び出しする        | マウント時に `analyze(skillName)` が1回呼ばれる                   |
| 3   | 分析結果の正常表示               | ScoreDisplay/SuggestionList/RiskPanel が結果データで描画される    |
| 4   | 分析失敗時のエラー表示           | API失敗時にエラーメッセージと再試行ボタンが表示される             |
| 5   | 再試行ボタンで分析を再実行する   | エラー状態で再試行ボタンをクリックすると `analyze` が再呼び出し   |
| 6   | 提案選択のトグル動作             | チェックボックスクリックで `selectedSuggestions` が更新される     |
| 7   | 選択した改善を適用する           | 適用ボタンクリックで `applyImprovements` が選択済み提案で呼ばれる |
| 8   | 全自動改善を実行する             | 全自動改善ボタンクリックで確認ダイアログ→ `autoImprove` 呼び出し  |
| 9   | 改善適用中のdisabled状態         | `isImproving` 中はボタン群がdisabledになる                        |
| 10  | onClose呼び出し                  | 閉じるボタンクリックで `onClose` コールバックが呼ばれる           |
| 11  | 空の提案リスト時の表示           | `suggestions` が空配列の場合、空状態メッセージが表示される        |
| 12  | 改善適用後に分析結果を再取得する | `applyImprovements` 成功後に `analyze` が再呼び出しされる         |

### Task 4: ScoreDisplay テストケース

ファイル: `apps/desktop/src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx`

| No  | テストケース名                       | 検証内容                                             |
| --- | ------------------------------------ | ---------------------------------------------------- |
| 1   | 総合スコアを数値表示する             | `overallScore` の値が画面に表示される                |
| 2   | カテゴリ別スコアバーを表示する       | 各カテゴリの名前とスコアバーが描画される             |
| 3   | 高スコア（80-100）に成功色を適用する | `variantStyles` の success 色が適用される            |
| 4   | 中スコア（60-79）に警告色を適用する  | `variantStyles` の warning 色が適用される            |
| 5   | 低スコア（0-59）にエラー色を適用する | `variantStyles` の error 色が適用される              |
| 6   | カテゴリの詳細テキストを表示する     | 各カテゴリの `details` が表示される                  |
| 7   | カテゴリの課題リストを表示する       | 各カテゴリの `issues` 配列が箇条書きで表示される     |
| 8   | ARIA属性が正しく設定される           | `role="progressbar"`, `aria-valuenow` 等が設定される |

### Task 5: SuggestionList テストケース

ファイル: `apps/desktop/src/renderer/components/skill/__tests__/SuggestionList.test.tsx`

| No  | テストケース名                             | 検証内容                                                         |
| --- | ------------------------------------------ | ---------------------------------------------------------------- |
| 1   | 提案リストを表示する                       | 全提案がリストアイテムとして描画される                           |
| 2   | 優先度別にグループ化する                   | high → medium → low の順でグループ見出しが表示される             |
| 3   | チェックボックスのトグルで onToggle を呼ぶ | チェックボックスクリックでインデックス付き `onToggle` が呼ばれる |
| 4   | 選択状態のチェックボックス表示             | `selected` Set に含まれるインデックスがチェック済みで描画される  |
| 5   | autoFixableバッジを表示する                | `autoFixable: true` の提案に自動修正バッジが表示される           |
| 6   | タイプバッジを表示する                     | 提案の `type`（prompt/structure等）がバッジで表示される          |
| 7   | 優先度バッジの色分け                       | high=エラー色、medium=警告色、low=情報色で色分けされる           |
| 8   | 空リスト時のメッセージ表示                 | 提案が0件の場合、「改善提案はありません」メッセージが表示される  |
| 9   | 提案の説明テキストを表示する               | 各提案の `description` が表示される                              |

### Task 6: RiskPanel テストケース

ファイル: `apps/desktop/src/renderer/components/skill/__tests__/RiskPanel.test.tsx`

| No  | テストケース名                           | 検証内容                                                       |
| --- | ---------------------------------------- | -------------------------------------------------------------- |
| 1   | リスク情報を表示する                     | 全リスクがリストアイテムとして描画される                       |
| 2   | criticalレベルにエラー色を適用する       | `level: "critical"` のリスクにエラー色が適用される             |
| 3   | highレベルに警告色を適用する             | `level: "high"` のリスクに警告色が適用される                   |
| 4   | medium/lowレベルに情報色を適用する       | `level: "medium"/"low"` に該当色が適用される                   |
| 5   | mitigationテキストを表示する             | `mitigation` が存在する場合、対策テキストが表示される          |
| 6   | mitigation未定義時は対策セクション非表示 | `mitigation` が undefined の場合、対策セクションが描画されない |
| 7   | impact情報を表示する                     | 各リスクの `impact` テキストが表示される                       |

### Task 7: Red 状態確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SuggestionList.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/RiskPanel.test.tsx
```

全36テストが FAIL（Red）であることを確認する。

---

## 統合テスト連携

| 連携先           | 方針                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| Phase 1 要件     | FR-1〜FR-5 の各機能要件に対応するテストケースを1つ以上作成            |
| Phase 2 設計     | コンポーネント Props / State 設計に基づくテストデータファクトリを作成 |
| Phase 3 レビュー | レビュー指摘事項があればテストケースに反映                            |
| IPC契約          | `window.electronAPI.skill` のモックがPreload APIの引数/戻り値型と一致 |
| セキュリティ     | バリデーションエラー時のUI表示テストを含む                            |
| アクセシビリティ | ARIA属性検証テストを ScoreDisplay/SuggestionList に含む               |

## 多角的チェック観点

| 観点           | 確認項目                                                            |
| -------------- | ------------------------------------------------------------------- |
| テスト網羅性   | FR-1〜FR-5 の全要件に対応するテストが存在する                       |
| モック整合性   | IPC APIモックの型が `skill-improver.ts` の型定義と一致している      |
| 環境対策       | P39（fireEvent使用）、P40（ディレクトリ依存）が全テストで遵守       |
| スタイルテスト | P47（variantStyles Record定数）がスコア色分けテストで使用されている |
| テスト独立性   | beforeEach でモックがリセットされ、テスト間で状態が共有されない     |
| 命名規則       | テストケース名が日本語で、検証内容が明確                            |

## 成果物

| 成果物                                   | タイプ         | 説明                         |
| ---------------------------------------- | -------------- | ---------------------------- |
| `outputs/phase-4/test-specification.md`  | テスト設計書   | テスト方針・モック戦略       |
| `outputs/phase-4/test-cases.md`          | テストケース表 | 全36テストケースの一覧       |
| `__tests__/SkillAnalysisView.test.tsx`   | テストコード   | SkillAnalysisView テスト12件 |
| `__tests__/ScoreDisplay.test.tsx`        | テストコード   | ScoreDisplay テスト8件       |
| `__tests__/SuggestionList.test.tsx`      | テストコード   | SuggestionList テスト9件     |
| `__tests__/RiskPanel.test.tsx`           | テストコード   | RiskPanel テスト7件          |
| `__tests__/helpers/mock-electron-api.ts` | テストヘルパー | IPC APIモック定義            |
| `__tests__/helpers/test-data-factory.ts` | テストヘルパー | テストデータファクトリ       |

> テストコードのパスはすべて `apps/desktop/src/renderer/components/skill/` 配下。

## 完了条件

- [ ] テスト設計方針（Task 1）が確定し、P39/P40/P47 対策が明示されている
- [ ] 共通テストユーティリティ（Task 2）が作成され、IPC モックと TestDataFactory が動作する
- [ ] SkillAnalysisView テスト12件が作成されている
- [ ] ScoreDisplay テスト8件が作成されている
- [ ] SuggestionList テスト9件が作成されている
- [ ] RiskPanel テスト7件が作成されている
- [ ] 全36テストが Red 状態（FAIL）であることを確認済み
- [ ] テストファイル内で `userEvent` を使用していない（P39）
- [ ] テスト実行が `cd apps/desktop && pnpm vitest run` で行われている（P40）
- [ ] スコア色分けテストで `variantStyles` Record定数を使用している（P47）
- [ ] IPC APIモックの型が `skill-improver.ts` の型定義と一致している
- [ ] 各テストが beforeEach でモックをリセットし、テスト間で状態を共有していない（P9）
- [ ] `outputs/phase-4/test-specification.md` が作成されている
- [ ] `outputs/phase-4/test-cases.md` が作成されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-7）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] 全36テストの Red 状態を確認

## 次のPhase

Phase 5（実装: TDD Green）へ進行する。Phase 4 で作成した全36テストを Green にするプロダクションコードを実装する。
