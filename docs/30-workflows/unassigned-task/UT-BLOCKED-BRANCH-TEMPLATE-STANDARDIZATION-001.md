# UT-BLOCKED-BRANCH-TEMPLATE-STANDARDIZATION-001 blocked分岐テンプレートの標準化

## メタ情報

```yaml
issue_number: 1407
```

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-BLOCKED-BRANCH-TEMPLATE-STANDARDIZATION-001                                 |
| タスク名     | blocked分岐フローの Phase仕様書テンプレート標準化                              |
| 分類         | スキル改善                                                                     |
| 対象機能     | task-specification-creator / phase-templates.md                                |
| 優先度       | 中                                                                             |
| 見積もり規模 | 小規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 Phase 12 スキルフィードバック |
| 発見日       | 2026-03-20                                                                     |

## 1. なぜこのタスクが必要か

### 1.1 背景

UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 では、前提タスク（Task12 Phase 5）が未完了のため blocked 状態が発生した。Phase 1 の P50 チェックで blocked 分岐を判定し、「設計確定値で先行実施 + P65注記付与」という方針を都度判断した。このパターンは仕様書同期タスクで頻出するが、標準テンプレートが存在しない。

### 1.2 問題点

- blocked分岐の判定基準がタスクごとに都度判断される
- P65注記の付与タイミングが明文化されていない
- docs-only タスクの Phase 4-9 の簡略化基準が不明確

### 1.3 放置した場合の影響

- 同種のタスクで判断にばらつきが生じる
- blocked 時の先行実施可否の判断に時間がかかる

## 2. 何を達成するか

### 2.1 目的

phase-templates.md に blocked 分岐テンプレートを追加し、docs-only タスクの軽量ワークフローを標準化する。

### 2.2 最終ゴール

- phase-templates.md に「仕様書同期タスク」セクションが追加されている
- blocked分岐判定フロー（設計確定値あり->先行実施/設計未確定->待機）がテンプレート化されている
- P65注記テンプレートが標準化されている
- docs-only タスクの Phase 4-9 対応表が記載されている

### 2.3 スコープ

| 含まれるもの                                      | 含まれないもの                   |
| ------------------------------------------------- | -------------------------------- |
| phase-templates.md への blocked分岐セクション追加 | 通常実装タスクのテンプレート変更 |
| docs-only タスクの Phase 対応表                   | Phase 仕様書の自動生成機能       |
| P65注記テンプレート                               | プロダクションコードの変更       |

## 3. どのように実現するか

### 3.1 実装手順

1. `.claude/skills/task-specification-creator/references/phase-templates.md` に「仕様書同期タスク」セクションを追加
2. blocked分岐判定フローをフローチャート形式で記載
3. docs-only タスクの Phase 4-9 対応表を作成
4. P65注記テンプレートを標準化

### 3.2 苦戦箇所の教訓

#### P57 再発（Phase 12 システム仕様書更新の先送り）

本タスクの Phase 12 で「worktree制約のためPRマージ時に実施」と LOGS.md/SKILL.md 更新を先送りしたが、これはP57の再発。worktree 環境でも .claude/skills/ は直接編集可能。

- **原因**: 「worktree 制約」という曖昧な理由で先送りを正当化した
- **教訓**: Phase 12 完了時点で .claude/skills/ を実更新する。「計画文」ではなく「実績ログ」のみを残す
- **対策**: Phase 12 テンプレートに「worktree でも .claude/skills/ は編集可能」を明記する

## 4. 受入基準

- [ ] phase-templates.md に blocked 分岐テンプレートが追加されている
- [ ] docs-only タスクの Phase 4-9 対応表が記載されている
- [ ] P65 注記テンプレートが標準化されている

## 5. 参照資料

| 資料                 | パス                                                                                          | 用途     |
| -------------------- | --------------------------------------------------------------------------------------------- | -------- |
| phase-templates.md   | `.claude/skills/task-specification-creator/references/phase-templates.md`                     | 更新対象 |
| スキルフィードバック | `docs/30-workflows/execution-status-type-spec-sync/outputs/phase-12/skill-feedback-report.md` | 提案元   |
