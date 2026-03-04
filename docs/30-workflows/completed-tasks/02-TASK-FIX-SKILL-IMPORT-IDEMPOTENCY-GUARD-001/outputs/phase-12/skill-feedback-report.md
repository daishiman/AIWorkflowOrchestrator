# Phase 12 スキルフィードバックレポート

## 良かった点

- 冪等化は API 契約（成功条件）と UI 事前ガードの二層で実装する。
- 「0件インポート」は失敗ではなく再実行成功として扱う契約を固定する。
- UI Hook 層で「追加中再実行抑止」「既存追加済み時のアニメーション抑止」を分離し、責務が明確。

## 改善提案

- Phase 11のスクリーンショットスクリプトに「診断JSON保存（呼び出し回数）」を共通オプション化する。
- `phase-11-manual-test.md` へ `テストケース` と `画面カバレッジマトリクス` をテンプレート必須化する。
- `useSkillCenter` と `agentSlice` の冪等条件差分を検出する静的チェック（同名ガード条件比較）を将来追加する。
- Phase 12 テンプレートに「検証スクリプト実体探索（`rg --files`）」を必須手順として固定する。
- Phase 12 のテスト再確認コマンドを `pnpm --filter @repo/desktop exec vitest run ...` に固定し、watchモード誤起動を禁止する。
- UI証跡再取得スクリプトは `pnpm --filter @repo/desktop run screenshot:<feature>` で実行できるよう scripts 登録を標準化する。
- capture script の遷移待機は `domcontentloaded` 基準 + 補助待機を共通化し、`page.goto` timeout 再発を抑止する。
