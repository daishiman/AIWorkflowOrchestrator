# Phase 9: 品質保証

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 9                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-C / SubAgent-D                        |

## 目的

テスト結果、セキュリティ観点、UX 観点、エラー観点を横断確認し、最終レビュー前に品質リスクを閉じる。

## 実行タスク

- 品質チェック: テスト、型、lint の結果を確認する
- セキュリティチェック: iframe/CSP/sanitize の漏れを確認する
- UXチェック: 04A のレイアウト契約との整合を確認する
- エラーチェック: timeout/read error/sanitize error の表示を確認する
- リスク記録: 残課題を open-items に記録する

## 参照資料

| 参照資料       | パス                                        | 説明          |
| -------------- | ------------------------------------------- | ------------- |
| Phase 5 成果物 | `outputs/phase-5/implementation-summary.md` | 品質評価対象  |
| Phase 7        | `phase-7-coverage-check.md`                 | coverage gate |
| Phase 8        | `phase-8-refactoring.md`                    | 境界整理      |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                        | 本Phaseで使う理由             |
| --------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート判定                |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | watch/allowlist 判定          |
| 入力検証        | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | sanitize/URL検証の妥当性判定  |
| 実装パターン    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31/P39/P40 の再発防止判定 |
| エラー処理      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類の整合              |
| UI機能仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Workspace 契約整合            |
| UI語彙仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Task 5D 用語整合              |

## 実行手順

### ステップ1: 品質ゲート確認

| 項目     | 判定基準                            |
| -------- | ----------------------------------- |
| テスト   | 全テスト PASS                       |
| 型       | typecheck PASS                      |
| lint     | lint エラー 0                       |
| coverage | Line80 / Branch60 / Function80 以上 |

### ステップ2: セキュリティ・エラー確認

| 項目              | 判定基準                                      |
| ----------------- | --------------------------------------------- |
| iframe 制約       | script が実行されない                         |
| sanitize          | 危険タグが描画されない                        |
| timeout 表示      | 再読み込み導線を表示する                      |
| read error 表示   | エラー文言と復帰導線を表示する                |
| retry 方針        | 5秒 timeout + 1秒間隔3回 retry が維持される   |
| URL検証           | `javascript:` 等の危険URLが描画経路へ入らない |
| ErrorBoundary     | render error 時に reset 復帰できる            |
| iframe crash 隔離 | iframe 失敗時も親UIが継続する                 |

### ステップ3: UX確認

- 04A の panel 表示規約と競合しない
- QuickSearch が mobile/tablet/desktop で破綻しない
- キーボード操作の導線が切れない
- Task 5D 用語（プレビュー/コード表示/ファイルをすばやく探す）に一致する

## 統合テスト連携

| 観点         | Phase 10 へ引き継ぐ内容     |
| ------------ | --------------------------- |
| 品質ゲート   | 判定結果と open-items       |
| セキュリティ | CSP/sanitize/iframe 判定    |
| UX           | responsive と keyboard 判定 |

## 成果物

| 成果物           | パス                                | 説明       |
| ---------------- | ----------------------------------- | ---------- |
| 品質レポート     | `outputs/phase-9/quality-report.md` | 総合判定   |
| セキュリティ確認 | `outputs/phase-9/security-check.md` | 防御確認   |
| 残課題一覧       | `outputs/phase-9/open-items.md`     | 未解消課題 |

## 完了条件

- [ ] 品質ゲート判定を定義している
- [ ] セキュリティ判定を定義している
- [ ] UX 判定を定義している
- [ ] open-items 記録方針を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 品質ゲート確認
2. セキュリティ確認
3. UX確認
4. 残課題整理
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-9/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 10: 最終レビューゲート](./phase-10-final-review.md)
