# UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 SkillExecutionStatus型拡張のシステム仕様書同期 - タスク指示書

## メタ情報

```yaml
issue_number: 1388
```

## メタ情報

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001                          |
| タスク名     | SkillExecutionStatus型に3値追加後のシステム仕様書同期                     |
| 分類         | 仕様書同期                                                                |
| 対象機能     | SkillExecutionStatus 型定義（packages/shared/src/types/skill.ts）         |
| 優先度       | 高                                                                        |
| 見積もり規模 | 小規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | Task12 仕様書作成時のシステム仕様書監査（2026-03-18）                     |
| 発見日       | 2026-03-18                                                                |
| 関連タスク   | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001（Task12）                      |
| トリガー     | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 の Phase 5（実装）完了後に実施 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001（Task12）は SkillExecutionStatus 型に "review" / "improve_ready" / "reuse_ready" の3値を新規追加する設計が確定している（phase-2-design.md で決定済み）。型変更先は packages/shared/src/types/skill.ts（P32 準拠）。しかし、この型変更に対応するシステム仕様書の更新は Task12 の Phase 12 完了時点では「実装完了後」として先送りされている。

### 1.2 問題点・課題

P26（システム仕様書更新遅延）パターンの再発リスク。Task12 の Phase 5 完了後にシステム仕様書の更新を忘れると、仕様書と実装の乖離が発生する。特に以下の仕様書が影響を受ける:

1. `interfaces-agent-sdk-integration.md` の SkillExecutionStatus テーブル（現在6値のみ記載）
2. `arch-state-management-core.md` の状態管理方針（ReuseReady状態の配置ルール未記載）

### 1.3 放置した場合の影響

- 後続のTask（Task09-11含む）の実装者が古い仕様書（6値）を参照し、新状態（9値）の存在を知らずに設計する
- exhaustive check パターン（never 型チェック）が使われている箇所で、仕様書にないcase追加の指示が欠落する

## 2. 何を達成するか（What）

### 2.1 目的

Task12 の実装完了時に、SkillExecutionStatus 型の3値追加をシステム仕様書に確実に反映する。

### 2.2 最終ゴール

- interfaces-agent-sdk-integration.md の SkillExecutionStatus テーブルに "review" / "improve_ready" / "reuse_ready" が追記されている
- arch-state-management-core.md にReuseReady状態の配置ルール（Zustand agentSlice）と個別セレクタ命名（useSkillExecutionStatus()）が記載されている
- P32 準拠で両ファイルが同時に更新されている

### 2.3 スコープ

| 含まれるもの                                         | 含まれないもの             |
| ---------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-integration.md の型テーブル更新 | プロダクションコードの変更 |
| arch-state-management-core.md の状態配置ルール追記   | Task12 の Phase 5 実装     |
| SkillExecutionStatus に関する全仕様書の grep 確認    | テストコードの変更         |

## 3. どのように実現するか（How）

### 3.1 実装手順

1. `grep -rn "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/` で全参照箇所を特定
2. interfaces-agent-sdk-integration.md の SkillExecutionStatus テーブルに3値を追記（各値の説明、遷移条件を含む）
3. arch-state-management-core.md に ReuseReady 状態の Zustand 配置ルールを追記
4. P32 準拠の同時更新チェックリストを実行
5. topic-map.md を再生成（`node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`）

### 3.2 苦戦箇所の教訓

#### P64 関連（GAP ID正本の後追い付番）

本タスクと直接の関連はないが、仕様書への後追い追記時は `grep` で全参照を確認してから記述することを推奨する。

#### P65 関連（存在しないProps/型値の前提）

本タスクの実施タイミングは Task12 の Phase 5 完了後。Phase 5 で実際に追加された型値（"review" / "improve_ready" / "reuse_ready"）の正確なスペルと意味をコードから確認してから仕様書に記載すること。設計時の想定値と実装時の最終値が異なる可能性がある。

### 3.3 前提条件

- TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 の Phase 5（実装）が完了していること
- packages/shared/src/types/skill.ts に3値が追加されていること

## 4. 受入基準

- [ ] interfaces-agent-sdk-integration.md の SkillExecutionStatus テーブルに "review" / "improve_ready" / "reuse_ready" の3値が追記されている
- [ ] 各値の説明（意味、遷移条件）が明記されている
- [ ] arch-state-management-core.md に ReuseReady 状態の配置ルールが追記されている
- [ ] `grep -rn "SkillExecutionStatus" .claude/skills/` で全参照箇所が最新の9値定義と整合している
- [ ] topic-map.md が再生成されている

## 5. 参照資料

| 資料                                | パス                                                                                                                | 用途           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------- |
| Task12 phase-2-design.md            | docs/30-workflows/skill-lifecycle-unification/tasks/step-08-seq-task-12-reuse-improve-state-cycle/phase-2-design.md | 型拡張設計     |
| interfaces-agent-sdk-integration.md | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md                               | 更新対象       |
| arch-state-management-core.md       | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                                     | 更新対象       |
| lessons-learned P64/P65             | .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md                                        | 苦戦箇所の教訓 |
