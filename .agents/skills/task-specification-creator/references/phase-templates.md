# Phase別テンプレートリファレンス

> 読み込み条件: `phase-*.md` を新規作成または大幅更新する時。

## family 構成

| file | 対象 | 役割 |
| --- | --- | --- |
| [phase-template-core.md](phase-template-core.md) | Phase 1-3 | 要件定義、設計、設計レビューの共通骨格 |
| [phase-template-phase1.md](phase-template-phase1.md) | Phase 1 | 要件定義 詳細テンプレート |
| [phase-template-execution.md](phase-template-execution.md) | Phase 4-10 | テスト、実装、品質、最終レビューの共通骨格 |
| [phase-template-phase8-10.md](phase-template-phase8-10.md) | Phase 8-10 | リファクタリング、品質保証、最終レビュー 詳細テンプレート |
| [phase-template-phase11.md](phase-template-phase11.md) | Phase 11 | 手動テスト 骨格・種別判定（設計タスク向けSF-01含む） |
| [phase-template-phase11-detail.md](phase-template-phase11-detail.md) | Phase 11 | 手動テスト 詳細テンプレート（スクリーンショット・カバレッジ手順） |
| [phase-template-phase12.md](phase-template-phase12.md) | Phase 12 | ドキュメント更新 補足（設計タスク向けSF-02/SF-03対応） |
| [phase-template-phase12-detail.md](phase-template-phase12-detail.md) | Phase 12 | ドキュメント更新 詳細テンプレート（5タスク全手順） |
| [phase-template-phase13.md](phase-template-phase13.md) | Phase 13 | PR作成 骨格・blocked ルール |
| [phase-template-phase13-detail.md](phase-template-phase13-detail.md) | Phase 13 | PR作成 詳細テンプレート（変更サマリー・タスク完了処理） |

## 共通ルール

1. タイトルは `# Phase N: ...` を維持する。
2. `## メタ情報`、`## 目的`、`## 実行タスク`、`## 参照資料`、`## 成果物`、`## 完了条件` を省略しない。
3. Phase 1〜11 では `## 統合テスト連携` を必ず残す。
4. `完了条件` と `タスク100%実行確認` はチェックリストで書く。
5. outputs と phase 本文の名称は 1:1 に揃える。

## 成果物配置ルール（重要）

| 成果物タイプ       | 配置先                         | Phase         |
| ------------------ | ------------------------------ | ------------- |
| ドキュメント成果物 | `outputs/phase-N/`             | 全Phase       |
| コード成果物       | プロジェクトの該当ディレクトリ | Phase 4, 5, 6 |

**コード成果物（テストコード、実装コード）は `outputs/` 配下に配置しない。**

## 主要変数

`{{FEATURE_NAME}}` / `{{PHASE_NUMBER}}` / `{{PHASE_NAME}}` / `{{CREATED_DATE}}` / `{{TASK_NAME}}`

## 関連テンプレート

`assets/phase-spec-template.md` / `assets/main-task-template.md` / `assets/implementation-guide-template.md` / `assets/documentation-changelog-template.md`

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-18 | 10ファイルのfamily構成へ再編。インデックスに変換 |
| 2026-03-12 | 1818行のmonolithからfamily file構成へ再編 |
