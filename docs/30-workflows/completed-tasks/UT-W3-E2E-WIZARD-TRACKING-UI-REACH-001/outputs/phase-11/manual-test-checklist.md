# Phase 11 手動確認チェックリスト

- [x] `skill-wizard-tracking.spec.ts` のテストケースが AC-1〜AC-7 の各受け入れ基準に対応していること
- [x] `wizard-tracking-stub.ts` のスタブが本番の `trackEvent` インターフェースと型整合していること
- [x] `apps/desktop/vite.e2e.config.ts` に trackEvent alias 設定が追加されていること
- [x] CI 設定（`.github/workflows/ci.yml`）に E2E テスト実行ステップが追加されていること
- [x] CI 設定で E2E テスト失敗時に PR がブロックされる設定になっていること
- [x] テストケースのコメント・命名が意図を明確に表現していること
- [x] スタブが `e2e/` ディレクトリ内にのみ存在し、本番コードに混入していないこと
