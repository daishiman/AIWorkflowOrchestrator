# [#1027] "[UT-10A-E-C-002] create/analyze 経路の store action 統一"

## メタ情報

```yaml
task_id: UT-10A-E-C-002
task_name: create/analyze 経路の store action 統一
category: 改善
target_feature: SkillCreateWizard / useSkillAnalysis
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 10/12
created_date: 2026-03-06
dependencies: []
spec_path: docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/unassigned-task/task-10a-e-c-create-analyze-store-action-migration-002.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-E-C で「直接IPC呼び出し禁止、store action経由へ統一」を定義したが、create/analyze 経路は未適用。

### 1.2 問題点・課題

`SkillCreateWizard` / `useSkillAnalysis` に direct IPC が残り、import 経路と設計境界が不整合。

### 1.3 放置した場合の影響

エラーハンドリング・状態遷移・テスト観点が経路ごとに分裂し、保守コストが増加する。

## 2. 何を達成するか（What）

### 2.1 目的

create/analyze を store action 経由に統一し、状態遷移契約を一貫化する。

### 2.2 最終ゴール

- 対象導線の direct IPC 呼び出し0件
- import/analyze/create 境界テストがPASS

### 2.3 スコープ

#### 含むもの

- create/analyze 呼び出し経路の移行
- 境界テスト更新

#### 含まないもの

- import lifecycle 仕様の再設計

### 2.4 成果物

- 呼び出し経路の修正コード
- 境界テスト結果
- 仕様同期差分

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F の設計範囲が確定していること

### 3.2 依存タスク

- TASK-10A-F

### 3.3 必要な知識

- Renderer store action 設計
- IPC契約とエラーハンドリング

### 3.4 推奨アプローチ

- 呼び出しは store action のみ
- UI層は状態参照と action 起動に限定

### 3.5 実装課題と解決策（親タスクからの教訓）

TASK-10A-E-C の実装で判明した苦戦箇所を、本タスク実装時の参考として記録する。

| 課題                                        | 発見経緯                                                                                                                                                | 解決策                                                                           | 教訓                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `.filter()` 派生selectorの無限ループ（P48） | Phase 8のリファクタリングで `renderHook` テストがタイムアウト。`.filter()` が毎回新しい配列参照を返し、Zustandの `Object.is` 比較で常に差分と判定された | `zustand/react/shallow` の `useShallow` でセレクタをラップし、shallow比較を適用  | create/analyze 経路で新規セレクタを追加する場合、配列を返すセレクタには必ず `useShallow` を適用する     |
| store action と直接IPC呼び出しの境界不整合  | Phase 10レビューで `SkillCreateWizard.tsx` と `hooks/useSkillAnalysis.ts` に `window.electronAPI.skill.` の直接呼び出しが5箇所残存していることを確認    | import経路はstore action経由に統一済み。create/analyze経路も同パターンで統一する | 移行時は `grep -rn "window.electronAPI.skill." apps/desktop/src/renderer/` で全残存箇所を先に特定する   |
| import/analyze/create 境界の相互非干渉      | Phase 6の境界テストで `importSkill` 実行時に `isAnalyzing`/`isImproving` が影響を受けないことを検証                                                     | `importSkill` の `set()` に analyze/create 関連状態を含めない設計を採用          | create/analyze のstore action移行時も、`set()` 呼び出しに import 関連状態を含めないことで境界を維持する |

**参照先**:

- [architecture-implementation-patterns.md#S18](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)（useShallow派生selectorパターン）
- [arch-state-management.md](../../.claude/skills/aiworkflow-requirements/references/arch-state-management.md)（import lifecycle selector/action契約）
- [06-known-pitfalls.md#P48](../../.claude/rules/06-known-pitfalls.md)（useShallow未適用による無限ループ）
- [06-known-pitfalls.md#P31](../../.claude/rules/06-known-pitfalls.md)（Zustand Store Hooks無限ループ）

## 4. 実行手順

### Phase構成

- Phase A: 呼び出し棚卸し
- Phase B: 移行実装
- Phase C: 境界検証と仕様同期

### Phase A: 呼び出し棚卸し

#### 目的

direct IPC の残存箇所を特定する。

#### 手順

1. `SkillCreateWizard` / `useSkillAnalysis` の direct IPC を列挙。
2. 対応する store action を定義。
3. 既存テストへの影響範囲を整理。

#### 成果物

- 棚卸しリスト

#### 完了条件

- 移行対象の漏れがない。

### Phase B: 移行実装

#### 目的

呼び出し経路を store action に統一する。

#### 手順

1. direct IPC 呼び出しを store action 経由へ置換。
2. エラー surface を store state に統一。
3. UI 層の依存を最小化。

#### 成果物

- 実装差分

#### 完了条件

- direct IPC 呼び出し0件。

### Phase C: 境界検証と仕様同期

#### 目的

責務分離を検証し、仕様へ反映する。

#### 手順

1. analyze/create/import 境界テストを実行。
2. 影響仕様書を同期。
3. 未タスク状態を更新。

#### 成果物

- テスト結果
- 仕様書更新差分

#### 完了条件

- 境界テストPASS、仕様整合完了。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] direct IPC 呼び出しが0件
- [ ] store action 経由に統一

### 品質要件

- [ ] analyze/create/import 境界テストPASS
- [ ] エラー surface が一貫

### ドキュメント要件

- [ ] 関連仕様書を同期

## 6. 検証方法

### テストケース

- create action 成功/失敗
- analyze action 成功/失敗
- import との非干渉

### 検証手順

1. `rg` で direct IPC 呼び出し0件確認。
2. 対象テストを実行。
3. 仕様書同期を確認。

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                                                            |
| ----------------------- | ------ | -------- | --------------------------------------------------------------- |
| 移行漏れ                | 中     | 中       | 経路棚卸しを先行                                                |
| 状態遷移の不整合        | 高     | 中       | 境界テストを追加                                                |
| useShallow未適用（P48） | 高     | 高       | 新規派生セレクタには `useShallow` を必ず適用（S18パターン準拠） |
| import境界への干渉      | 高     | 中       | `set()` に import 関連状態を含めず、境界テストで非干渉を検証    |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`（S18: useShallow派生selectorパターン）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（TASK-10A-E-Cセクション）
- `.claude/rules/06-known-pitfalls.md`（P48: useShallow未適用による無限ループ）

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし

### 補足事項

本未タスクは `TASK-10A-F` 管轄として実施する。
