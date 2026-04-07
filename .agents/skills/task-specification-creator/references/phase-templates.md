# Phase別テンプレートリファレンス（インデックス）

> 読み込み条件:
> `phase-*.md` を新規作成または大幅更新する時。

## family 構成

| file | 対象 | 役割 |
| --- | --- | --- |
| [phase-template-core.md](phase-template-core.md) | Phase 1-3 | 成果物配置ルール・変数一覧・共通ルール・要件定義/設計/レビューの共通構造 |
| [phase-template-execution.md](phase-template-execution.md) | Phase 4-10 | テスト、実装、品質、最終レビュー |
| [phase-template-phase1.md](phase-template-phase1.md) | Phase 1 | 要件定義テンプレート・P50チェック |
| [phase-template-phase8-10.md](phase-template-phase8-10.md) | Phase 8-10 | リファクタリング・品質保証・最終レビューゲート。IPC契約ドリフト検証を含む |
| [phase-template-phase11.md](phase-template-phase11.md) | Phase 11 | manual walkthrough と screenshot evidence。種別判定（設計/docs-only/UI）を含む |
| [phase-template-phase11-detail.md](phase-template-phase11-detail.md) | Phase 11 | 詳細テンプレート。インタラクション状態テーブル・N/A理由テーブル・完了条件詳細 |
| [phase-template-phase12.md](phase-template-phase12.md) | Phase 12 | 設計タスク向け補足（SF-02, SF-03）・未タスク配置先・ファイル名照合チェック |
| [phase-template-phase12-detail.md](phase-template-phase12-detail.md) | Phase 12 | 詳細テンプレート。5タスク全体の手順・成果物・完了条件・漏れやすいポイント |
| [phase-template-phase13.md](phase-template-phase13.md) | Phase 13 | user approval と PR blocked ルール |
| [phase-template-phase13-detail.md](phase-template-phase13-detail.md) | Phase 13 | 詳細テンプレート。変更サマリー・PR作成・CI確認・タスク完了処理・変数一覧 |

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-12 | 1818行の monolith から family file 構成へ再編 |
| 2026-04-07 | 1247行の monolith から family file 構成へ再分割（インデックスに縮小） |
