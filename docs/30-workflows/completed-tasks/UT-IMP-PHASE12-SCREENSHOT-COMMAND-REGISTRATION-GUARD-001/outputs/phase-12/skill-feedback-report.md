# Phase 12 スキルフィードバック

## 成功点

- `task-specification-creator` の検証スクリプト群（validate/verify/audit）が、コマンド統一タスクの完了判定に有効だった。
- `aiworkflow-requirements` の `task-workflow` / `lessons-learned` 同期により、再利用可能な運用ルールを残せた。

## 改善点

- screenshot実行時の optional dependency 欠落（`@rollup/rollup-darwin-x64`）を事前検知する preflight が不足していた。
- screenshot実行時の `Port 5174 is already in use` を実行前に検出し、停止/再利用分岐を記録する手順が不足していた。
- screenshotコマンド実行後のプロセス残留を監視する停止確認手順を明文化すべき。

## 次回改善候補

1. screenshot capture script の preflight（依存チェック + `lsof` ポート検査 + server終了確認）を追加する。
2. `pnpm run screenshot:*` 系コマンドに共通の失敗診断ガイドをテンプレート化する。
3. Phase 11 手動検証テンプレートへ「視覚レビュー観点（一貫性/フィードバック/リスク導線）」を固定項目として追加する。
