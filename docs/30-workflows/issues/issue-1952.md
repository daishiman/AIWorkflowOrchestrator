# [#1952] [UT-TEMPLATE-STANDARDIZATION-001] task-workflow-active.md 出力テンプレートへの `> 区分:` 形式追加

## メタ情報

```yaml
issue_number: 1952
title: [UT-TEMPLATE-STANDARDIZATION-001] task-workflow-active.md 出力テンプレートへの `> 区分:` 形式追加
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1952
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`task-workflow-active.md` の「出力テンプレート」セクションに `> 区分:` フィールドを追加し、今後作成される child companion ドキュメントで `> 区分:` の付与を標準化する。

## 背景・目的

UT-VERIFY-DOC-CONSOLIDATION-001 にて `> 区分:` 形式を新たに導入したが、`task-workflow-active.md` の出力テンプレートには未反映。テンプレートに統合しないと、新規 child companion 作成時に `> 区分:` が漏れるリスクが継続する。

## 対象ファイル

- `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`（「出力テンプレート」セクション）

## 実装ガイド（Phase 12 相当）

### 実装手順

1. `task-workflow-active.md` を Read し、「出力テンプレート」セクションの現在の構造を確認
2. H1 タイトルの直後（または `> 役割:` の直後）に以下を追記:
   ```
   > 区分: [正本|履歴記録|契約仕様]（description）
   <!-- 区分値: 正本 / 履歴記録（history record）/ 契約仕様（current contract）から選択 -->
   ```
3. 既存の `task-workflow-active.md` / `task-workflow-completed.md` の実ファイルとの形式統一を確認

### 完了条件

- [ ] 「出力テンプレート」セクションに `> 区分:` フィールドが追加されている
- [ ] 区分値の選択ガイド（正本 / 履歴記録 / 契約仕様）が記載されている
- [ ] 既存の実ファイルとの形式が統一されている

## 苦戦箇所（予測）

- `task-workflow-active.md` の「出力テンプレート」セクションの構造を事前確認してから変更することが重要
- `> 役割:` との位置関係（どちらを先に記載するか）の統一方針を決定する必要あり

## 参照

- タスク仕様書: `docs/30-workflows/unassigned-task/UT-TEMPLATE-STANDARDIZATION-001.md`
- 発見元: UT-VERIFY-DOC-CONSOLIDATION-001 Phase 12 skill-feedback-report 改善提案#2
- 関連 Issue: #1916（UT-VERIFY-DOC-CONSOLIDATION-001）
- 関連タスク: UT-CHILD-COMPANION-LABELING-001（child companion への `> 区分:` 付与）
