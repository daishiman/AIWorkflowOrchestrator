# Phase 12: スキルフィードバックレポート

## テンプレート改善

小規模リファクタリングタスク（型外部化）向けに、以下の改善を提案する：

- Phase 7 カバレッジ計測で「変更ファイル外」が自動除外される仕組みがあると、
  既存コードの未到達行に対する誤ったアラートが減る
- `vitest.config.ts` の `resolve.alias` 追加が必要なケースを、
  Phase 2 型設計書に「テスト環境設定の注意事項」として明示するとよい

## ワークフロー改善

- `@repo/shared` への型追加を標準フローとして定義することを提案する：
  1. `src/types/*.ts` にファイル作成
  2. `package.json` の `exports` と `typesVersions` を同時更新
  3. 利用側 `tsconfig.json` の `paths` に追加
  4. 利用側 `vitest.config.ts` の `resolve.alias` に追加（value import の場合）
  - このフローをチェックリストとして `CLAUDE.md` や開発ガイドに追記する

## ドキュメント改善

- 変換テーブル設計（`rawValue → displayLabel` のパターン）を横断ガイドライン化することを提案する：
  - 他の質問（q7 以降）や別ウィザードでも同じパターンが使える
  - `QuestionSemanticLabelMap` の DI パターンをデザインパターン集に掲載すると再利用性が高まる
