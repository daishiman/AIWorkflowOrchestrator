# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 1                                    |
| Phase 名   | 要件定義                             |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | なし                                 |
| 後続 Phase | Phase 2（設計）                      |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

AgentView の実行完了後 UI とSkillAnalysisView の現状を調査し、改善導線を追加するための機能要件・非機能要件・受入基準を明文化する。

## 実行タスク

- 現状調査: AgentView の実行完了後 UI 構造、スキル選択状態の管理方法、SkillAnalysisView の既存 prop を確認する
- 要件抽出: 因果ループ断絶3（AgentView → SkillAnalysis）と断絶4（SkillAnalysis → Agent）の解決要件を抽出する
- 受入基準定義: AC-1〜AC-7 の検証可能な完了条件を定義する
- スコープ確定: 対象ファイル・除外範囲・依存タスクとの責務境界を確定する

## 参照資料

| 参照資料              | パス                                                                     | 内容                                                   |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                    | 実行完了後 UI の現状コードを確認する                   |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`       | 既存の prop 設計・onClose コールバックを確認する       |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                      | renderView の skillAnalysis case 有無を確認する        |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`              | 現状の ViewType 定義と遷移元情報の有無を確認する       |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`          | L62 付近の「結果を見て改善判断へつなぐ」仕様を確認する |
| AgentView テスト      | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 既存のテスト契約を確認する                             |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                        | 内容                                         |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様               |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillEditor / AgentView 仕様   |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand/IPC の実装パターン                   |
| スキルライフサイクル統合   | `docs/30-workflows/skill-lifecycle-routing/index.md`                                        | パック全体の依存グラフと補助 Codepath 所有表 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使うコードパス・正本仕様・依存タスクの成果物を確認し、agentview-improve-route の調査対象範囲を固定する。特に skillLifecycleJourney.ts の L62 付近で「因果ループ断絶」の根拠を確認する。

### ステップ2: P50 チェック（既実装状態の調査）

実装前に対象ファイルの現在の実装状態を確認する。AgentView に既に改善 CTA に相当する実装がないか、SkillAnalysisView に既に戻り導線 prop がないかを確認し、新規実装 / 補完どちらのモードで進めるかを判定する。

```bash
# AgentView の実行完了後 UI 確認
grep -n "完了\|complete\|onComplete\|improve\|analysis" apps/desktop/src/renderer/views/AgentView/index.tsx

# SkillAnalysisView の prop 確認
grep -n "onNavigate\|onBack\|onClose\|prop" apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx
```

### ステップ3: 実行タスクを上から順に実施する

要件定義の実行タスクを上から順に処理し、スコープ・受入基準・除外範囲を成果物へ反映する。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AgentView の実行完了状態検出・CTA 表示ロジック・遷移アクション、SkillAnalysisView の戻り導線の接続要件を要件として明文化する。

## 多角的チェック観点

| 観点             | 適用判断                       | 仕様参照先                                                         |
| ---------------- | ------------------------------ | ------------------------------------------------------------------ |
| UI/UX            | フロントエンド実装が対象       | `aiworkflow-requirements: ui-ux-navigation.md`                     |
| アーキテクチャ   | Zustand 状態管理の設計変更あり | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| アクセシビリティ | UI 実装の場合 WCAG 2.1 AA 必須 | `aiworkflow-requirements: ui-ux-feature-components.md`             |

**Electron デスクトップアプリ観点**:

| 層                         | 適用判断                     | 仕様参照先                                             |
| -------------------------- | ---------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | React コンポーネント追加あり | `aiworkflow-requirements: ui-ux-feature-components.md` |

## 成果物

| 成果物       | パス                                         | 内容                                     |
| ------------ | -------------------------------------------- | ---------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲・除外範囲・依存境界を明記する   |

## 完了条件

- [ ] AgentView の実行完了後 UI 構造（スキル選択状態の持ち方を含む）が整理されている
- [ ] SkillAnalysisView の現状 prop（onClose のみか複数か）が確認されている
- [ ] 因果ループ断絶3・断絶4 の根拠が要件として明文化されている
- [ ] AC-1〜AC-7 が検証可能な条件として定義されている
- [ ] 依存タスク（Task01/02/03）との責務境界が確定している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 2（設計）](./phase-2-design.md) に進む
