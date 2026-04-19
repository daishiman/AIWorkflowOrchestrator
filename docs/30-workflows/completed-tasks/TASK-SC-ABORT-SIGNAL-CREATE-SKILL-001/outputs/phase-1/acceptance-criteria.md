# Phase 1: 受け入れ基準

| AC   | 条件                                                                            | 検証方法       |
| ---- | ------------------------------------------------------------------------------- | -------------- |
| AC-1 | `createSkill()` のキャンセル契約が既存 cancel テストと矛盾しない                | テストレビュー |
| AC-2 | `runOrchestrateWorkflow()` / `runCreateWorkflow()` の入口で `signal` を確認する | コードレビュー |
| AC-3 | create / orchestrate / collaborative の正常系が非回帰である                     | 既存テスト実行 |
| AC-4 | Phase 11/12/13 と artifacts parity が skill 規約に一致する                      | 仕様レビュー   |

## 縮約根拠

- 旧仕様の「未実装の大問題」は誤前提。`createSkill()` の public 契約は成立済み。
- 本タスクの主題は private workflow 入口での一貫性修正のみ。
- 4 件の AC で「契約の一貫性」「非回帰」「仕様整合」をカバーする。
