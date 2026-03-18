# スキルフィードバックレポート

## タスク

UT-06-005-A-HOOK-FALLBACK-INTEGRATION

## 改善提案

| 改善提案                                       | 詳細                                                                                                                                                                                                                                                                    | 優先度 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| screenshot 実体チェック追加                    | 1x1 ダミー PNG が手動テスト証跡として残っていた。Phase 11/12 ガイドに「画像サイズ検証（`file` コマンド）」を追加すべき                                                                                                                                                  | 高     |
| workflow 台帳同値化チェック                    | `outputs` が揃っていても `index.md` / `artifacts.json` が pending のまま残存。Phase 12 で同値チェックを必須化すべき                                                                                                                                                     | 高     |
| 環境ブロッカー記録の定型化                     | 将来のテスト再実行不能（esbuild mismatch など）発生時に、`discovered-issues.md` へ Note 記録するテンプレートを追加すべき                                                                                                                                                | 中     |
| CLI 環境 Phase 11 スクリーンショット取得ガイド | CLI 環境では Playwright の `page.screenshot()` または `xvfb-run` + headless モードを使う方法を Phase 11 仕様書テンプレートに追記すべき。現状は「撮影不可時の代替」に NOTE.txt のみ記載されている                                                                        | 高     |
| Phase 12 4ファイル更新チェックスクリプト標準化 | P1/P25/P29 の LOGS.md × 2 + SKILL.md × 2 の更新漏れ防止のため、Phase 12 仕様書テンプレートに `grep -rn "TASK_ID" .claude/skills/*/LOGS.md .claude/skills/*/SKILL.md` を必須コマンドとして追加すべき                                                                     | 高     |
| Phase 8/9 成果物の明示的定義                   | artifacts.json の Phase 8 に `refactoring-log.md` しか定義されておらず、`code-quality-check.md` と `test-pass-confirmation.md` が漏れた。Phase 9 も同様に `security-check.md` と `test-execution-log.md` が不足。Phase 8/9 テンプレートの「成果物」テーブルを拡充すべき | 中     |
| Promise.race + settled フラグ パターン追加     | `sendPermissionRequestWithTimeout` で実装した Promise.race + settled フラグ + clearTimeout の組み合わせは IPC タイムアウト制御の汎用パターン。`architecture-implementation-patterns-reference-ipc-fallback-validation.md` に S32 として追加済み                         | 中     |

## 追加パターン

- Main Process 専用タスクでも、review board 方式でスクリーンショット証跡を残す
- `current`（今回差分）と `baseline`（既存負債）を changelog で分離記載する
- IPC 層の非同期タイムアウト制御は Promise.race + settled フラグ + clearTimeout の3点セットで実装する（S32 参照）

## 対応状況

| 改善提案                                       | 対応内容                                                                               | ステータス |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| screenshot 実体チェック追加                    | 本レポートに記録。Phase 11 テンプレート更新は未タスク候補                              | 記録済み   |
| workflow 台帳同値化チェック                    | 本レポートに記録。Phase 12 チェックリスト強化は未タスク候補                            | 記録済み   |
| 環境ブロッカー記録の定型化                     | 本レポートに記録。phase-11-12-guide.md への反映は未タスク候補                          | 記録済み   |
| CLI 環境 Phase 11 スクリーンショット取得ガイド | 本レポートに記録。Phase 11 テンプレート更新は未タスク候補（P53 既存登録あり）          | 記録済み   |
| Phase 12 4ファイル更新チェックスクリプト標準化 | 本レポートに記録。Phase 12 テンプレート更新は未タスク候補                              | 記録済み   |
| Phase 8/9 成果物の明示的定義                   | 本レポートに記録。Phase 8/9 テンプレート更新は未タスク候補                             | 記録済み   |
| Promise.race + settled フラグ パターン         | `architecture-implementation-patterns-reference-ipc-fallback-validation.md` S32 に追加 | **完了**   |
