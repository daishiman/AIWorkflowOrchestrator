# [#2050] docs(skill-wizard): Phase 11 スクリーンショット命名規則の明文化 [UT-W2-03A-SCREENSHOT-NAMING-CONVENTION-001]

## メタ情報

```yaml
issue_number: 2050
title: docs(skill-wizard): Phase 11 スクリーンショット命名規則の明文化 [UT-W2-03A-SCREENSHOT-NAMING-CONVENTION-001]
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2050
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

Phase 11 手動テストのスクリーンショット命名規則を明文化し、全タスクで統一された命名を使用できるようにする。

## 背景

W2-seq-03a Phase 11 で `skillPath` 表示・外部連携チェックリスト確認のスクリーンショットが取得されたが、命名規則が明文化されておらず再検証時の証跡追跡が困難。

## 変更内容

- `docs/30-workflows/phase11-screenshot-naming-guide.md` を新規作成
- 命名規則: `TC-{phase}-{seq}-{feature}-{state}.png` 形式を定義
- W2-seq-03a Phase 11 スクリーンショットの命名規則準拠確認

## 完了条件

- [ ] 命名規則ガイドラインが作成されている
- [ ] W2-seq-03a Phase 11 スクリーンショットが命名規則に準拠している
- [ ] 将来タスクへの適用ガイドラインが記載されている

## 発見元

W2-seq-03a Phase 12 スキルフィードバックレポート（2026-04-08）

## 仕様書

`docs/30-workflows/unassigned-task/UT-W2-03A-SCREENSHOT-NAMING-CONVENTION-001.md`
