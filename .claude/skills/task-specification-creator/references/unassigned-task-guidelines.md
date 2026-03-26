# 未完了タスク記録ガイドライン

> **Progressive Disclosure**
>
> - 読み込みタイミング: Phase 12（ドキュメント）での未タスク検出時
> - 読み込み条件: 未完了タスク指示書の品質チェックが必要なとき
> - 関連スキーマ: schemas/unassigned-task.json
> - 関連スクリプト: scripts/detect-unassigned-tasks.js

## 概要

このガイドラインは、タスク実行中に発見された未対応課題を
「誰でも実行可能な粒度」でドキュメント化するための基準を定義する。

**目標**: 100人中100人が同じ理解でタスクを実行できる品質

**重要**:

- Phase 12 で発見した follow-up は raw メモのまま閉じない
- `docs/30-workflows/unassigned-task/` に置く時点で full template 準拠へ昇格させる
- `audit-unassigned-tasks.js --target-file <path>` で `currentViolations = 0` を確認してから完了扱いにする

---

## split guide

| file | 使う場面 | 内容 |
| --- | --- | --- |
| [unassigned-task-detection-guide.md](unassigned-task-detection-guide.md) | Phase 12 検出・監査実行時 | 検出コマンド、監査手順、baseline/current分離、出力要件 |
| [unassigned-task-quality-standards.md](unassigned-task-quality-standards.md) | 指示書作成・品質確認時 | メタ情報規約、Why/What/How品質基準、命名規則、優先度・規模基準 |
| [unassigned-task-workflow-integration.md](unassigned-task-workflow-integration.md) | Phase 10/11連携・タスク完了時 | レビュー連携、手動テスト連携、完了フロー、横断パターン |

---

## 参照リソース

- テンプレート: `assets/unassigned-task-template.md`
- エージェント: `agents/generate-unassigned-task.md`
