# Phase 11 成果物: 手動テストチェックリスト

## 実施方針

- 本タスクは UI 変更を含まないため、Phase 11 は `NON_VISUAL` として扱う
- 画面キャプチャは要求せず、ログと targeted test を一次証跡とする
- ただし補助成果物として `screenshot-plan.json` は残し、非視覚判定を明示する

## チェックリスト

| テストケース | 種別                                  | 実施可否 | 結果 | 証跡                    | 備考                                           |
| ------------ | ------------------------------------- | -------- | ---- | ----------------------- | ---------------------------------------------- |
| NV-11-01     | 自動インスタンス化ログ確認            | 実施     | PASS | `manual-test-result.md` | `"dynamic resource pipeline activated"` を確認 |
| NV-11-02     | manifest 自動発見ログ確認             | 実施     | PASS | `manual-test-result.md` | candidate からの自動発見ログを確認             |
| NV-11-03     | static fallback ログ確認              | 実施     | PASS | `manual-test-result.md` | static loader fallback ログを確認              |
| NV-11-04     | resource 不足時の degraded error 確認 | 実施     | PASS | `manual-test-result.md` | `resource_loader_unavailable` を確認           |
| NV-11-05     | discovered issues の引き継ぎ確認      | 実施     | PASS | `discovered-issues.md`  | Phase 12 入力に使用                            |
