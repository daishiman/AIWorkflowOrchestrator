# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| Phase 名   | 要件定義                                   |
| タスクID   | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 |
| 前提 Phase | なし                                       |
| 後続 Phase | Phase 2（設計）                            |
| ステータス | not_started                                |
| 作成日     | 2026-03-17                                 |
| 機能名     | lifecycle-reuse-improve-cycle              |

## 目的

ui-ux-diagrams.md の状態遷移図から ReuseReady の遷移条件と ImproveReady → Running の再実行サイクルを抽出し、agentSlice.ts の現在の状態管理・SkillLifecyclePanel の完了後フローを調査したうえで、両サイクルの機能要件・非機能要件・受入基準を明文化する。

## 実行タスク

1. ui-ux-diagrams.md の Core Journey 状態遷移図（L40-54）から `Review --> ReuseReady: accepted` の遷移条件（トリガー、ガード条件、遷移後の UI 状態）を抽出する
2. `packages/shared/src/types/skill.ts` の現在の SkillExecutionStatus 型定義（"idle" | "running" | "permission_pending" | "completed" | "cancelled" | "error" の6値）を確認し、以下3つの新規状態を追加することを要件として確定する:
   - `"review"`: completed 後にユーザーが結果を確認している状態
   - `"improve_ready"`: 改善提案が確定し再実行待ちの状態
   - `"reuse_ready"`: スキル結果が採用され再利用可能な状態

   また agentSlice.ts の状態遷移ロジック（executeSkill / applySkillImprovements / 各アクション）を調査し、これら3値の追加に影響する箇所を列挙する（P32 準拠: 型定義の正本は packages/shared/src/types/skill.ts であり、agentSlice.ts はこの型を import しているだけである）

3. SkillLifecyclePanel の completed 状態後の UI 表示ロジック（CTAの表示条件・非表示条件）を確認し、「採用して再利用」CTA を追加できる箇所を特定する
4. SkillManagementPanel の再利用導線（selectSkillByName / executeSkill の呼び出しパス）の現状を確認し、ReuseReady 状態からの遷移先として適切かを判定する
5. Improve → Re-execute のユーザーフロー定義（採用方式は Phase 2 で確定済み。別アクション方式（`reExecuteAfterImprovement` アクション）を採用する。理由: SRP に基づき applySkillImprovements() は改善適用に専念し、再実行トリガーは呼び出し元の責務とする。詳細は phase-2-design.md の「Improve → Running 遷移の実装方式」セクションを参照）
6. 「もう一度使う」CTA の遷移先（SkillManagementPanel への復帰 または AgentView への直接遷移）を ui-ux-realization.md L18 の Reuse フェーズ定義と照合し、遷移先を決定する

## 参照資料

| 参照資料             | パス                                                                  | 内容                                                              |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| UI/UX 状態遷移図     | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`     | L40-54: Core Journey 状態遷移図（ReuseReady / ImproveReady 定義） |
| UI/UX 一次導線       | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`  | L11-18: Reuse フェーズ要件（CTA「もう一度使う」・遷移先の根拠）   |
| agentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                | SkillExecutionStatus 型の現在の定義・アクション一覧               |
| SkillLifecyclePanel  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | completed / review 状態後の UI 表示ロジック・CTA の現状           |
| SkillManagementPanel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | selectSkillByName / executeSkill の呼び出しパス                   |
| navigationSlice      | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`           | navigateTo / setCurrentView の既存インターフェース                |
| agentSlice テスト    | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts` | 既存のテスト契約（SkillExecutionStatus の現状テスト）             |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                        | 内容                                            |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様                  |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillLifecyclePanel / SkillManagementPanel 仕様 |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand / IPC の実装パターン                    |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                                                      | Zustand 設計原則・個別セレクタ使用義務          |
| arch-state-management-core | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`           | 状態管理方針、セレクタ命名規約                  |

## 実行手順

### ステップ1: 参照資料を確認する

ui-ux-diagrams.md の状態遷移図（L40-54）と ui-ux-realization.md の Reuse フェーズ定義（L11-18）を読み込み、要件定義の前提を固める。次に `packages/shared/src/types/skill.ts` の SkillExecutionStatus 型（P32: 型定義の正本）と SkillLifecyclePanel の現状コードを確認する。

### ステップ2: P50 チェック（既実装状態の調査）

実装前に対象ファイルの現在の実装状態を確認する。agentSlice.ts に `reuse_ready` 状態が既に定義されていないか、SkillLifecyclePanel に「採用して再利用」相当の実装がないかを確認し、新規実装 / 補完どちらのモードで進めるかを判定する。

```bash
# agentSlice の SkillExecutionStatus 型確認
grep -n "reuse_ready\|SkillExecutionStatus\|skillExecutionStatus" apps/desktop/src/renderer/store/slices/agentSlice.ts

# SkillLifecyclePanel の CTA 表示ロジック確認
grep -n "accept\|reuse\|再利用\|ReuseReady\|review" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# applySkillImprovements の完了後処理確認
grep -n "applySkillImprovements\|reExecute\|running" apps/desktop/src/renderer/store/slices/agentSlice.ts
```

### ステップ3: 実行タスクを上から順に実施する

タスク 1〜6 を上から順に処理し、遷移条件・採用方式・遷移先の決定を成果物へ反映する。特にタスク 5（Improve → Re-execute の実装方式）とタスク 6（「もう一度使う」の遷移先）は Phase 2 の設計に直接影響するため、根拠を明記する。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、Phase 2 への handoff を確認して記録する。

## 統合テスト連携

agentSlice の状態遷移・SkillLifecyclePanel の CTA 表示条件・SkillManagementPanel への再利用導線の接続要件を要件として明文化する。

## 多角的チェック観点

| 観点             | 適用判断                       | 仕様参照先                                                         |
| ---------------- | ------------------------------ | ------------------------------------------------------------------ |
| UI/UX            | フロントエンド実装が対象       | `aiworkflow-requirements: ui-ux-feature-components.md`             |
| アーキテクチャ   | Zustand 状態管理の設計変更あり | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| アクセシビリティ | UI 実装の場合 WCAG 2.1 AA 必須 | `aiworkflow-requirements: ui-ux-feature-components.md`             |

**Electron デスクトップアプリ観点**:

| 層                         | 適用判断                     | 仕様参照先                                             |
| -------------------------- | ---------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | React コンポーネント追加あり | `aiworkflow-requirements: ui-ux-feature-components.md` |

## 成果物

| 成果物       | パス                                             | 内容                                                               |
| ------------ | ------------------------------------------------ | ------------------------------------------------------------------ |
| 要件分析書   | `outputs/phase-1/requirements-analysis.md`       | 遷移条件・機能要件・非機能要件・受入基準・実装方式の決定を整理する |
| 現状調査結果 | `outputs/phase-1/current-state-investigation.md` | agentSlice / SkillLifecyclePanel の現状と GAP を記録する           |

## 完了条件

- [ ] ui-ux-diagrams.md の `Review --> ReuseReady: accepted` の遷移条件（トリガー、ガード、遷移後状態）が明文化されている
- [ ] `packages/shared/src/types/skill.ts` の SkillExecutionStatus 型と `"review"` / `"improve_ready"` / `"reuse_ready"` 追加に影響する箇所が特定されている（P32 準拠: agentSlice.ts は import 先であり型定義の正本ではない）
- [ ] SkillLifecyclePanel の completed / review 状態後の UI 表示ロジックが確認され、CTA 追加箇所が特定されている
- [ ] Improve → Re-execute の実装方式（完了コールバック方式 vs 別アクション方式）が決定され、根拠が明記されている
- [ ] 「もう一度使う」CTA の遷移先（SkillManagementPanel / AgentView）が決定され、ui-ux-realization.md との整合根拠が記録されている
- [ ] AC-1〜AC-10 が検証可能な条件として定義されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 2（設計）](./phase-2-design.md) に進む
