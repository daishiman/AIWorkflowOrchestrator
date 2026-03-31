# TASK-P0-07-MANIFEST-PHASE-ID-CANONICALIZATION-001: manifest phase ID 正規名称のドキュメント化

## メタ情報

```yaml
issue_number: 1779
task_id: TASK-P0-07-MANIFEST-PHASE-ID-CANONICALIZATION-001
task_name: manifest phase ID 正規名称のドキュメント化
category: ドキュメント
target_feature: workflow-manifest.json phase ID
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-P0-07 Phase 12 unassigned-task-detection（2026-03-30）
created_date: 2026-03-30
dependencies: [TASK-P0-07]
```

| 項目         | 内容                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-P0-07-MANIFEST-PHASE-ID-CANONICALIZATION-001                                                                                                 |
| タスク名     | manifest phase ID 正規名称のドキュメント化                                                                                                        |
| 分類         | ドキュメント                                                                                                                                      |
| 対象機能     | `workflow-manifest.json` の phase ID 命名規則                                                                                                     |
| 優先度       | 低                                                                                                                                                |
| 見積もり規模 | 小規模                                                                                                                                            |
| ステータス   | 未実施                                                                                                                                            |
| 発見元       | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/outputs/phase-12/unassigned-task-detection.md` |
| 発見日       | 2026-03-30                                                                                                                                        |

## 背景

TASK-P0-07 で、テストフィクスチャの phase ID を `phase-plan` から正規名称（`requirements-gathering` / `plan` / `improve`）に統一した。しかし、この正規名称はどこにもドキュメントとして定義されていない。

`workflow-manifest.json` を作成するユーザーや開発者が、どの phase ID を使えばよいかを知る方法がない状態になっている。

## 目的

`workflow-manifest.json` のスキーマドキュメントまたは `interfaces-agent-sdk-skill-reference.md` に、canonical phase ID 一覧を記載する。

## 受入基準

| ID   | 基準                                               |
| ---- | -------------------------------------------------- |
| AC-1 | canonical phase ID 一覧がドキュメント化されている  |
| AC-2 | 各 phase ID の意味・用途が説明されている           |
| AC-3 | `OPERATION_PHASE_IDS` との対応関係が明示されている |

## スコープ

**含む**:

- `interfaces-agent-sdk-skill-reference.md` または新規ドキュメントに phase ID 一覧を追記
- skill-creator workflow の phase 構成例（plan / improve の phase 定義例）

**含まない**:

- スキーマの強制バリデーション（それは TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001 のスコープ）

## 期待する出力

```markdown
### 正規 phase ID 一覧（skill-creator workflow）

| Phase ID                 | 用途             | Operation |
| ------------------------ | ---------------- | --------- |
| `requirements-gathering` | 要件収集フェーズ | plan      |
| `plan`                   | 計画立案フェーズ | plan      |
| `improve`                | 改善提案フェーズ | improve   |
```

## 苦戦箇所の記録

命名規則が暗黙的であることに気づいたのは、テストフィクスチャを `phase-plan` から変更した時点。コードを読まないと正規名称を知ることができないという問題が潜在していた。
