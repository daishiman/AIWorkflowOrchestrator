# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目             | 値                                      |
| ---------------- | --------------------------------------- |
| Phase            | 5                                       |
| Phase名          | 実装                                    |
| 機能名           | SkillAnalysisView（スキル分析ビュー）   |
| タスクID         | TASK-10A-B                              |
| 前提Phase        | Phase 4（テスト作成完了、全テスト Red） |
| 後続Phase        | Phase 6（テスト拡充）                   |
| 作成日           | 2026-03-02                              |
| スタイリング     | Tailwind CSS + Apple HIG System Colors  |
| アイコン         | lucide-react のみ使用                   |
| コンポーネント数 | 4（organism 1 + molecule 3）            |

## 目的

Phase 4 で作成した全36テストを Green にするプロダクションコードを実装する。SkillAnalysisView（organism）と ScoreDisplay, SuggestionList, RiskPanel（molecule）の4コンポーネントを Apple HIG 準拠の Tailwind CSS スタイリングで実装し、IPC 経由のスキル分析・改善機能をUIから操作可能にする。

## 実行タスク

- 共通スタイル定義: variantStyles Record定数とデザイントークンを実装する
- ScoreDisplay 実装: 総合スコアとカテゴリ表示を実装する
- SuggestionList 実装: 優先度別提案リストと選択UIを実装する
- RiskPanel 実装: リスクレベル別表示と詳細表示を実装する
- SkillAnalysisView 実装: サブコンポーネント統合と状態遷移を実装する
- Green確認: Phase 4の全テストをPASSにする

## 参照資料

| 資料名                         | パス                                                                              | 説明                            |
| ------------------------------ | --------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義               | `phase-1-requirements.md`                                                         | FR/NFR/受け入れ基準             |
| Phase 2 設計                   | `phase-2-design.md`                                                               | コンポーネント設計・Props定義   |
| Phase 4 テスト作成             | `phase-4-test-creation.md`                                                        | テストケース一覧・Red状態       |
| バックエンド型定義             | `packages/shared/src/types/skill-improver.ts`                                     | SkillAnalysis/Suggestion/Risk型 |
| UIデザインシステム             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | デザイントークン・配色          |
| UIデザイン原則                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Apple HIG / WCAG 準拠           |
| IPC API契約                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | analyze/improve/optimize 契約   |
| 型インターフェース             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 戻り値型/引数型の一致確認       |
| Preload/IPC境界セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextBridge 経由公開の制約    |
| IPC入力バリデーション          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証/trim検証要件         |
| エラー応答契約                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | UI側エラー表示仕様の整合        |
| アーキテクチャルール           | `.claude/rules/01-architecture.md`                                                | Apple HIG カラーパレット        |
| P46: HTMLAttributes型衝突      | `.claude/rules/06-known-pitfalls.md#P46`                                          | Omitで型衝突回避                |
| P47: CSS変数テストアサーション | `.claude/rules/06-known-pitfalls.md#P47`                                          | variantStyles Record定数        |

## aiworkflow-requirements 仕様抽出結果（実装Phase）

| 実装観点            | 仕様書                                                                            | 実装で固定する内容                           |
| ------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| UIトークン          | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | CSS変数・色・余白の定義を実装に反映          |
| UI品質              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | HIG/WCAGに沿った見た目・操作性               |
| IPC契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:*` チャネルの引数/戻り値を固定        |
| API応答共通規約     | `.claude/skills/aiworkflow-requirements/references/api-core.md`                   | エラー応答/成功応答形式の整合                |
| 型契約              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `SkillAnalysis`/`ImprovementResult` の型一致 |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextBridge公開面とメソッド境界の遵守      |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証と入力バリデーション前提のUI設計   |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 分析/改善失敗時のメッセージ設計              |
| テスト方針          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | コンポーネント単位の検証粒度                 |
| a11yテスト          | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | ARIA/WCAG観点のテストケース整備              |

## 実行手順

### Task 1: 共通スタイル定義

#### 1-1: スコア色分け variantStyles

`ScoreDisplay.tsx` のモジュールスコープに export する Record 定数。P47 準拠でテスト側から import して期待値を検証する。

```typescript
// スコア閾値に基づく色分け
export type ScoreVariant = "success" | "warning" | "error";

export const scoreVariantStyles: Record<ScoreVariant, string> = {
  success: "text-[var(--status-success)] bg-[var(--status-success)]/10",
  warning: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
  error: "text-[var(--status-error)] bg-[var(--status-error)]/10",
};

export const getScoreVariant = (score: number): ScoreVariant => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
};
```

#### 1-2: リスクレベル variantStyles

```typescript
// RiskPanel.tsx
export type RiskLevelVariant = "critical" | "high" | "medium" | "low";

export const riskLevelStyles: Record<RiskLevelVariant, string> = {
  critical:
    "text-[var(--status-error)] bg-[var(--status-error)]/10 border-[var(--status-error)]/20",
  high: "text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20",
  medium:
    "text-[var(--status-info)] bg-[var(--status-info)]/10 border-[var(--status-info)]/20",
  low: "text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)]",
};
```

#### 1-3: 優先度 variantStyles

```typescript
// SuggestionList.tsx
export type PriorityVariant = "high" | "medium" | "low";

export const priorityStyles: Record<PriorityVariant, string> = {
  high: "text-[var(--status-error)] bg-[var(--status-error)]/10",
  medium: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
  low: "text-[var(--status-info)] bg-[var(--status-info)]/10",
};
```

### Task 2: ScoreDisplay コンポーネント実装

ファイル: `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`

#### Props定義

```typescript
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

interface ScoreDisplayProps {
  analysis: SkillAnalysis;
}
```

#### 実装仕様

| 要素                 | 実装内容                                                                          |
| -------------------- | --------------------------------------------------------------------------------- |
| 総合スコア表示       | `overallScore` を大きな数値（text-4xl）+ スコアバリアント色で表示                 |
| カテゴリ別スコアバー | 各カテゴリの名前、スコア値、プログレスバー（width%）を表示                        |
| カテゴリ詳細         | `details` テキストと `issues` 配列の箇条書き                                      |
| ARIA属性             | `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` |
| スコア色分け         | `getScoreVariant()` + `scoreVariantStyles` Record使用                             |

#### Atomic Design階層: molecule

### Task 3: SuggestionList コンポーネント実装

ファイル: `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`

#### Props定義

```typescript
import type { Suggestion } from "@repo/shared/types/skill-improver";

interface SuggestionListProps {
  suggestions: Suggestion[];
  selected: Set<number>;
  onToggle: (index: number) => void;
}
```

#### 実装仕様

| 要素               | 実装内容                                                            |
| ------------------ | ------------------------------------------------------------------- |
| 優先度別グループ化 | `high` → `medium` → `low` の順でセクション見出し付きで表示          |
| チェックボックス   | 各提案にチェックボックスを配置、`selected` Set で状態管理           |
| タイプバッジ       | `type`（prompt/structure/documentation/security/performance）を表示 |
| 優先度バッジ       | `priorityStyles` Record で色分けしたバッジ表示                      |
| autoFixableバッジ  | `autoFixable: true` の場合に「自動修正可能」バッジを表示            |
| 説明テキスト       | `description` を各提案の本文として表示                              |
| 空リスト時         | 提案0件の場合「改善提案はありません」メッセージを表示               |

#### Atomic Design階層: molecule

### Task 4: RiskPanel コンポーネント実装

ファイル: `apps/desktop/src/renderer/components/skill/RiskPanel.tsx`

#### Props定義

```typescript
import type { Risk } from "@repo/shared/types/skill-improver";

interface RiskPanelProps {
  risks: Risk[];
}
```

#### 実装仕様

| 要素           | 実装内容                                                     |
| -------------- | ------------------------------------------------------------ |
| リスクリスト   | 各リスクをカード形式で表示                                   |
| レベル別色分け | `riskLevelStyles` Record で border/bg/text を色分け          |
| カテゴリ表示   | `category`（security/compatibility/performance/maintenance） |
| 説明表示       | `description` テキストを表示                                 |
| impact表示     | 「影響」ラベル付きで `impact` テキストを表示                 |
| mitigation表示 | `mitigation` が存在する場合のみ「対策」ラベル付きで表示      |
| 空リスト時     | リスク0件の場合「リスクは検出されていません」メッセージ表示  |

#### Atomic Design階層: molecule

### Task 5: SkillAnalysisView コンポーネント実装

ファイル: `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`

#### Props定義

```typescript
import type { ImportedSkill } from "../../store/skillSlice";

interface SkillAnalysisViewProps {
  skill: ImportedSkill;
  onClose: () => void;
}
```

#### 状態管理（useState ベース、Phase 1 要件 §5 準拠）

| 状態名                | 型                      | 初期値      | 説明                         |
| --------------------- | ----------------------- | ----------- | ---------------------------- |
| `analysis`            | `SkillAnalysis \| null` | `null`      | 分析結果                     |
| `isAnalyzing`         | `boolean`               | `false`     | 分析中フラグ                 |
| `isImproving`         | `boolean`               | `false`     | 改善適用中フラグ             |
| `selectedSuggestions` | `Set<number>`           | `new Set()` | 選択された提案のインデックス |
| `error`               | `string \| null`        | `null`      | エラーメッセージ             |

#### ライフサイクル・イベントハンドラ

| ハンドラ名               | トリガー                  | 処理内容                                                     |
| ------------------------ | ------------------------- | ------------------------------------------------------------ |
| `handleAnalyze`          | マウント時 / 再試行ボタン | `analyze(skill.name)` 呼び出し → 結果を `analysis` に設定    |
| `handleToggleSuggestion` | チェックボックスクリック  | `selectedSuggestions` Set のトグル                           |
| `handleApplySelected`    | 「選択を適用」ボタン      | `applyImprovements(skill.name, selected)` → 結果表示→再分析  |
| `handleAutoImprove`      | 「全自動改善」ボタン      | 確認ダイアログ → `autoImprove(skill.name)` → 結果表示→再分析 |
| `handleClose`            | 閉じるボタン              | `onClose()` コールバック呼び出し                             |

#### useEffect 依存関係

```typescript
// マウント時に分析を自動実行
useEffect(() => {
  handleAnalyze();
}, [skill.name]);
```

#### レイアウト構成

```
┌─────────────────────────────────────┐
│ ヘッダー: スキル名 + 閉じるボタン    │
├─────────────────────────────────────┤
│ [ローディング中]                     │
│   → スケルトンローダー表示           │
│ [エラー時]                           │
│   → エラーメッセージ + 再試行ボタン  │
│ [分析結果表示]                       │
│   ┌─ ScoreDisplay ──────────────┐   │
│   │ 総合スコア + カテゴリ別バー │   │
│   └──────────────────────────────┘   │
│   ┌─ SuggestionList ────────────┐   │
│   │ 優先度別改善提案リスト      │   │
│   │ [チェックボックス選択]      │   │
│   └──────────────────────────────┘   │
│   ┌─ RiskPanel ─────────────────┐   │
│   │ リスク情報一覧              │   │
│   └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ フッター:                            │
│   [選択を適用] [全自動改善] ボタン   │
└─────────────────────────────────────┘
```

#### Apple HIG 準拠スタイリング

| 要素             | スタイル                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 背景             | `bg-[var(--bg-primary)]`                                                                                                      |
| ヘッダー         | `px-6 py-4 border-b border-[var(--border-primary)]`                                                                           |
| コンテンツ       | `p-6 space-y-6 overflow-y-auto`                                                                                               |
| フッター         | `px-6 py-4 border-t border-[var(--border-primary)] flex gap-3`                                                                |
| プライマリボタン | `bg-[var(--accent-primary)] text-[var(--text-inverse)] rounded-lg px-4 py-2 hover:opacity-90 transition-opacity duration-200` |
| セカンダリボタン | `bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg px-4 py-2 border border-[var(--border-primary)]`              |
| disabled状態     | `opacity-50 cursor-not-allowed`                                                                                               |
| カード           | `rounded-xl border border-[var(--border-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]`                                        |
| スペーシング     | 8px グリッド（`p-2`, `p-4`, `p-6`, `gap-2`, `gap-4`）                                                                         |

#### Atomic Design階層: organism

### Task 6: 全テスト Green 確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SuggestionList.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/RiskPanel.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
```

全36テストが PASS（Green）であることを確認する。

---

## 統合テスト連携

| 連携先           | 方針                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| Phase 4 テスト   | 全36テストが Green になることを実装の完了基準とする                                    |
| IPC契約          | `window.electronAPI.skill.analyze/applyImprovements/autoImprove` のPreload API型と一致 |
| セキュリティ     | IPC呼び出し時の引数はPreload層（safeInvokeUnwrap）でバリデーション済み                 |
| アクセシビリティ | ARIA属性（progressbar、label）をコンポーネント実装に含む                               |
| デザイン基盤     | CSS変数ベースのデザイントークンを使用、variantStyles Record定数をexport                |

## 多角的チェック観点

| 観点               | 確認項目                                                         |
| ------------------ | ---------------------------------------------------------------- |
| テスト Green       | 全36テストが PASS している                                       |
| 型安全             | `any` 型を使用していない、Props型が明示的                        |
| Apple HIG          | カラーパレット/スペーシング/角丸/影がルール準拠                  |
| アクセシビリティ   | ARIA属性、キーボード操作、コントラスト比がNFR-2準拠              |
| P46対策            | HTMLAttributes との型衝突がある場合は Omit で回避している        |
| P47対策            | variantStyles Record定数がモジュールスコープに export されている |
| 状態管理           | useState ベースのローカル状態、Zustand Store不使用               |
| エラーハンドリング | 分析失敗/改善失敗/ネットワークエラーの3パターンをUI表示          |

## 成果物

| 成果物                                      | タイプ         | 説明                     |
| ------------------------------------------- | -------------- | ------------------------ |
| `outputs/phase-5/implementation-summary.md` | 実装サマリー   | 実装結果の概要           |
| `ScoreDisplay.tsx`                          | コンポーネント | スコア表示（molecule）   |
| `SuggestionList.tsx`                        | コンポーネント | 提案リスト（molecule）   |
| `RiskPanel.tsx`                             | コンポーネント | リスクパネル（molecule） |
| `SkillAnalysisView.tsx`                     | コンポーネント | 分析ビュー（organism）   |

> コンポーネントのパスはすべて `apps/desktop/src/renderer/components/skill/` 配下。

## 完了条件

- [ ] ScoreDisplay コンポーネントが実装され、8テストが Green
- [ ] SuggestionList コンポーネントが実装され、9テストが Green
- [ ] RiskPanel コンポーネントが実装され、7テストが Green
- [ ] SkillAnalysisView コンポーネントが実装され、12テストが Green
- [ ] 全36テストが PASS（Green）
- [ ] `any` 型を使用していない
- [ ] Apple HIG 準拠のスタイリング（CSS変数ベースのデザイントークン使用）
- [ ] variantStyles Record定数が各コンポーネントから export されている（P47）
- [ ] HTMLAttributes 型衝突がある場合は Omit で回避されている（P46）
- [ ] 状態管理が useState ベースで Zustand Store を使用していない
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1-6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] 全36テストの Green 状態を確認

## 次のPhase

Phase 6（テスト拡充）へ進行する。カバレッジ不足箇所を特定し、境界値・異常系・アクセシビリティ・統合テストを追加する。
