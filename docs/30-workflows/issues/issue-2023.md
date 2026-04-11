# [#2023] [UT-IMP-PHASE2-CONTRACT-MATRIX-DTO-SYNC-001] Phase-2 contract matrix の DTO 変更自動追従スクリプト

## メタ情報

```yaml
issue_number: 2023
title: [UT-IMP-PHASE2-CONTRACT-MATRIX-DTO-SYNC-001] Phase-2 contract matrix の DTO 変更自動追従スクリプト
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2023
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

Phase-2 設計成果物（contract matrix）に記載された DTO shape と、実コード上の TypeScript 型定義の乖離を自動検知する監査スクリプトを作成し、ドキュメントの正確性を継続的に保証する。

## 背景

Phase-2 の設計フェーズでは、contract matrix に DTO のフィールド名・型・構造を記述し、後続フェーズの実装ガイドとして参照される。しかし、Phase-5 実装中に DTO shape が変更された場合、contract matrix 側の更新が行われないケースが頻発している。

この乖離は Phase-12 ドキュメント段階まで検出されず、以下の問題を引き起こす：

- reader の誤誘導: contract matrix を信頼して実装・レビューする開発者が、実際とは異なる DTO shape を前提に判断してしまう
- Phase-12 手戻り: ドキュメント最終段階で乖離に気づき、matrix の遡及修正が必要になる
- 手動追従の限界: DTO 変更のたびに matrix を手動で更新するワークフローは、忘れやすく持続可能でない

## 実行タスク

1. Phase-2 contract matrix からの DTO 参照抽出パーサー（`outputs/phase-2/` 配下の Markdown テーブルを解析）
2. TypeScript 型定義からの DTO shape 取得（`packages/shared/src/types/` 配下をパース）
3. 差分検知ロジックの実装（フィールド追加・削除・型変更・optional/required 不一致）
4. CI / pre-commit 統合（終了コードで差分の有無を表現）
5. レポート出力フォーマットの定義（人間可読・JSON 形式）

## 受入基準

- [ ] DTO フィールドの追加・削除・型変更を正しく検知できる
- [ ] Phase-2 contract matrix 内の DTO 参照（テーブル形式）を正しく抽出できる
- [ ] 差分レポートが人間可読な形式で出力される
- [ ] JSON 形式の機械可読出力をサポートする
- [ ] CI パイプラインで実行可能（終了コードで結果を表現）
- [ ] pre-commit hook として利用可能
- [ ] 差分がない場合は正常終了（exit 0）する
- [ ] 複数の matrix ファイル・複数 DTO を一括検証できる

## 由来

lessons-learned L-WLC-012 相当（Phase 2 contract matrix が DTO 更新に追従しない問題）

関連仕様書: `docs/30-workflows/unassigned-task/UT-IMP-PHASE2-CONTRACT-MATRIX-DTO-SYNC-001.md`
