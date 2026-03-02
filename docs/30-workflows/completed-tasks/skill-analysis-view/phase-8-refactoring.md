# Phase 8: リファクタリング — SkillAnalysisView

## メタ情報

| 項目       | 値                                             |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-10A-B                                     |
| Phase      | 8（リファクタリング）                          |
| 前Phase    | Phase 7（カバレッジ確認）                      |
| 次Phase    | Phase 9（品質保証）                            |
| 依存成果物 | Phase 5 実装コード、Phase 7 カバレッジレポート |

## 目的

Phase 5 で実装した SkillAnalysisView および関連コンポーネントのコード品質を改善する。DRY 原則・単一責務原則・Atomic Design に基づき、保守性・可読性・再利用性を向上させる。リファクタリング後も全テストが PASS することを保証する。

## 実行タスク

- カスタムフック抽出: 分析ロジックを `useSkillAnalysis` に分離する
- 責務分離: 各コンポーネントの表示責務とロジック責務を分ける
- 定数/型整理: 閾値定数と型定義を再配置して重複を削除する
- スタイル整理: Tailwind CSS クラスを統合して可読性を上げる
- 回帰確認: テスト全PASSとカバレッジ維持を確認する

## 参照資料

### プロジェクトルール

- `.claude/rules/01-architecture.md` — Atomic Design、レイヤー依存方向
- `.claude/rules/02-code-quality.md` — コーディング規約、型安全、DRY
- `.claude/rules/03-state-management.md` — Zustand 個別セレクタ、リスナー管理
- `.claude/rules/06-known-pitfalls.md` — P31（個別セレクタ）、P46（Omit パターン）、P47（variantStyles）

### システム仕様（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` — アーキテクチャ設計原則
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG 準拠
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` — コンポーネント設計

### 前 Phase 成果物

- `phase-1-requirements.md` — 要件定義（品質目標・制約）
- `phase-2-design.md` — 設計仕様（責務境界・層構造）
- `outputs/phase-5/implementation-summary.md` — 実装内容の要約
- `phase-6-test-expansion.md` — テスト拡充内容（保護テスト範囲）
- `outputs/phase-7/coverage-report.md` — カバレッジ判定結果

## 実行手順

### Task 1: カスタムフック抽出

SkillAnalysisView の分析ロジックを `useSkillAnalysis(skillName)` カスタムフックに分離する。

**抽出対象:**

| 抽出元                     | 抽出先                        | 責務                       |
| -------------------------- | ----------------------------- | -------------------------- |
| SkillAnalysisView 内の状態 | `useSkillAnalysis(skillName)` | 分析状態管理・API 呼び出し |

**フック内部の状態と関数:**

```typescript
// hooks/useSkillAnalysis.ts
interface UseSkillAnalysisReturn {
  analysis: SkillAnalysis | null;
  isAnalyzing: boolean;
  isImproving: boolean;
  error: string | null;
  selectedSuggestions: Set<number>;
  toggleSelection: (index: number) => void;
  applySelected: () => Promise<void>;
  autoImprove: () => Promise<void>;
}

function useSkillAnalysis(skillName: string): UseSkillAnalysisReturn;
```

**抽出する状態:**

- `analysis: SkillAnalysis | null` — 分析結果
- `isAnalyzing: boolean` — 分析中フラグ
- `isImproving: boolean` — 改善適用中フラグ
- `error: string | null` — エラーメッセージ
- `selectedSuggestions: Set<number>` — 選択された提案のインデックス

**抽出する関数:**

- `toggleSelection(index: number)` — 提案の選択切り替え
- `applySelected()` — 選択した改善の適用
- `autoImprove()` — 全自動改善の実行

**P31 対策:** カスタムフック内の IPC 呼び出しは `window.electronAPI.skill` の直接参照とし、Zustand Store の合成 Hook は使用しない。

### Task 2: コンポーネント責務分離

各コンポーネントの責務を明確に分離する。

| コンポーネント    | 責務                       | Atomic Design レベル |
| ----------------- | -------------------------- | -------------------- |
| SkillAnalysisView | レイアウト・フック接続のみ | organisms            |
| ScoreDisplay      | スコア表示・色分けロジック | molecules            |
| SuggestionList    | 提案一覧・選択管理         | molecules            |
| RiskPanel         | リスク表示・重要度色分け   | molecules            |

**分離基準:**

- SkillAnalysisView にビジネスロジックを残さない
- 各子コンポーネントは Props 経由でデータを受け取る（自身で IPC を呼ばない）
- 子コンポーネントは独立してテスト可能であること

### Task 3: 定数・型定義の整理

#### 3-1: スコア閾値定数

```typescript
// constants/skill-analysis.ts
export const SCORE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
} as const;
```

#### 3-2: variantStyles Record 定数（P47 準拠）

```typescript
// ScoreDisplay.tsx（モジュールスコープ）
export const scoreVariantStyles: Record<"high" | "medium" | "low", string> = {
  high: "text-[var(--status-success)] bg-[var(--status-success-bg)]",
  medium: "text-[var(--status-warning)] bg-[var(--status-warning-bg)]",
  low: "text-[var(--status-error)] bg-[var(--status-error-bg)]",
};
```

テスト側はこの Record 定数を import して期待値を生成する。ハードコード文字列でのアサーションは禁止。

#### 3-3: 型安全性強化

- `as` 型アサーション禁止（P19 準拠）
- HTML 標準属性と衝突するカスタム Props は `Omit` で回避（P46 準拠）
- boolean 変数は `is` / `has` / `can` / `should` プレフィックス

### Task 4: Tailwind CSS クラスの整理

- 重複するクラス定義を `cn()` ユーティリティで統合
- デザイントークン（CSS 変数）を一貫して使用
- Apple HIG 準拠のカラーパレット（`01-architecture.md` のシステムカラー）を使用
- Tailwind Slate は使用しない

### Task 5: テスト全 PASS 確認

リファクタリング後、以下を実行して全テストが PASS することを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

**確認項目:**

- [ ] 全テストが PASS
- [ ] テスト数がリファクタリング前と同数以上
- [ ] カバレッジがリファクタリング前と同等以上

## 統合テスト連携

リファクタリングは内部構造の変更のみであり、外部インターフェース（Props・IPC チャンネル）は変更しない。統合テストの修正は不要。

## 多角的チェック観点

| 観点          | 確認内容                                              |
| ------------- | ----------------------------------------------------- |
| 単一責務      | 各コンポーネント・フックが1つの責務のみを持つ         |
| DRY           | 重複コードがない                                      |
| 型安全        | `as` / `any` / `@ts-ignore` が存在しない              |
| Atomic Design | コンポーネント階層が atoms/molecules/organisms に適合 |
| P31 対策      | Zustand 個別セレクタのみ使用（合成 Hook 禁止）        |
| P46 対策      | HTMLAttributes 衝突は Omit で回避                     |
| P47 対策      | variantStyles を Record 定数で export                 |
| Apple HIG     | カラーパレット・スペーシング・角丸がルール準拠        |
| テスト安定性  | リファクタリング前後でテスト数・カバレッジが維持      |

## 成果物

| 成果物               | パス                                 |
| -------------------- | ------------------------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` |

## 完了条件

- [ ] `useSkillAnalysis` カスタムフックが抽出され、SkillAnalysisView がレイアウトのみに簡素化されている
- [ ] ScoreDisplay / SuggestionList / RiskPanel が独立したコンポーネントとして分離されている
- [ ] スコア閾値・variantStyles が定数として抽出されている（P47 準拠）
- [ ] `as` 型アサーション・`any` 型・`@ts-ignore` が存在しない
- [ ] HTML 標準属性との衝突は `Omit` で回避されている（P46 準拠）
- [ ] Zustand 個別セレクタのみ使用し、合成 Hook を使用していない（P31 準拠）
- [ ] Tailwind CSS クラスが整理され、デザイントークンが一貫して使用されている
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/skill/` が全 PASS
- [ ] テスト数がリファクタリング前と同数以上
- [ ] カバレッジがリファクタリング前と同等以上
- [ ] `refactoring-log.md` に変更内容が記録されている

## 次の Phase

Phase 9（品質保証）へ進む。
