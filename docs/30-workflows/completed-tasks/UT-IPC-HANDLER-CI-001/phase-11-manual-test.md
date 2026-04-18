# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 11                                                |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 10                                          |
| 後続Phase  | Phase 12                                          |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

CI 環境でのスナップショットテスト自動実行を手動で検証し、`NON_VISUAL` タスクとして必要な証跡を `manual-test-result.md` を正本に集約する。

## 種別判定

`NON_VISUAL` / test-and-ci task

- UI/UX 変更なし
- Renderer コンポーネント変更なし
- 手動検証の一次ソースは `docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-11/manual-test-result.md`
- 視覚レビューは `ui-sanity-visual-review.md` に N/A と根拠を残す

## テスト方式

docs-only 証跡集約ポリシーを採用し、以下を `manual-test-result.md` に 1 ファイル集約する。

- テスト件数サマリー（正常系 / 異常系 / edge case / 合計）
- edge case 一覧表（EC-NNN）
- 仕様判断根拠（SD-NNN）
- 実行記録（コマンド / 確認対象 / 判定）
- 発見事項の分類（Blocker / Note / Info）

## 実行タスク

### Task 1: ローカルテスト実行確認

`pnpm --filter @repo/desktop test` を手動実行し、追加したスナップショットテストが全パスすることを確認する。

```bash
pnpm --filter @repo/desktop test
```

確認項目:

- [ ] `registerRuntimeSkillCreatorHandlers` のスナップショットテストが実行される
- [ ] 全テストが PASS する
- [ ] スナップショットファイルが `__snapshots__/` 配下に生成されている

### Task 2: 重複チャンネル追加によるテスト失敗確認

重複チャンネルを意図的に追加してテスト失敗を確認する（確認後は必ず元に戻すこと）。

手順:

1. 対象ファイルに同一チャンネル名の `ipcMain.handle()` を 1 行追加する
2. `pnpm --filter @repo/desktop test` を実行してテストが失敗することを確認する
3. 追加したコードを削除して元の状態に戻す
4. 再度 `pnpm --filter @repo/desktop test` を実行して全パスすることを確認する

確認項目:

- [ ] 重複チャンネル追加後にテストが失敗する
- [ ] エラーメッセージにチャンネル名または重複の旨が含まれる
- [ ] 元に戻した後にテストが全パスする

### Task 3: GitHub Actions CI 検証

GitHub Actions の CI ログを確認し、テストが自動実行されることを確認する。

確認方法:

- PR または push 時に CI が起動されることを確認する
- CI のログで `pnpm --filter @repo/desktop test` または相当するステップが実行されていることを確認する
- CI が全て PASS していることを確認する

確認項目:

- [ ] CI が自動起動される
- [ ] テストステップが実行される
- [ ] CI が PASS する

### Task 4: 視覚証跡 N/A 記録

UI 変更を伴わないため、`docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-11/ui-sanity-visual-review.md` に以下を記録する。

- `NON_VISUAL` 判定理由
- スクリーンショット不要の根拠
- 代替証跡として採用する CLI / CI ログ
- 環境起因の制約がある場合の記録方法

## 参照資料

- `outputs/phase-10/` — Phase 10 成果物（最終レビュー結果、出荷準備チェック）

## 実行手順

1. Phase 10 の最終レビュー結果を確認し、引き継ぎ事項を固定する。
2. ローカル実行・異常系確認・CI 検証を順に実施し、結果を `manual-test-result.md` に集約する。
3. 補助成果物として `manual-test-checklist.md` と `discovered-issues.md` を作成する。
4. 視覚証跡は `ui-sanity-visual-review.md` に N/A 理由と代替証跡を記録する。
5. 成果物を `outputs/phase-11/` に保存し、完了条件を判定する。

## 成果物

`outputs/phase-11/` 配下に以下のファイルを作成する。

| ファイル名                   | 内容                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| `manual-test-result.md`      | 手動テスト結果の正本。件数サマリー、edge case、仕様判断根拠、実行記録を集約 |
| `manual-test-checklist.md`   | 実施項目の補助チェックリスト                                                |
| `discovered-issues.md`       | 実行中に見つかった Blocker / Note / Info                                    |
| `ui-sanity-visual-review.md` | `NON_VISUAL` 判定と視覚証跡 N/A 記録                                        |

## 統合テスト連携

- ローカル実行結果と GitHub Actions 上の結果を比較し、差異があれば `manual-test-result.md` と `discovered-issues.md` に記録する。
- Phase 12 ではこの結果を `implementation-guide.md` の `## 視覚証跡` セクションと `system-spec-update-summary.md` へ引き継ぐ。

## 多角的チェック観点

| 観点     | 確認内容                                                                                     |
| -------- | -------------------------------------------------------------------------------------------- |
| 矛盾     | `NON_VISUAL` 判定と実際の変更内容に矛盾がないか確認する                                      |
| 漏れ     | ローカル実行、異常系確認、CI 検証、視覚証跡 N/A 記録が全て揃っているか確認する               |
| 整合性   | EC-NNN / SD-NNN / 実行コマンド / 代替証跡の記載形式が統一されているか確認する                |
| 依存関係 | Phase 12 が参照する一次証跡として `manual-test-result.md` が十分な粒度を持っているか確認する |

## 完了条件

- [ ] ローカルで `pnpm --filter @repo/desktop test` が全パスすることを手動確認済み
- [ ] 重複チャンネルを追加した場合にテストが失敗することを手動確認済み
- [ ] CI でテストが自動実行されることが確認または設定されている
- [ ] `manual-test-result.md` が一次ソースとして必要情報を集約している
- [ ] `ui-sanity-visual-review.md` に `NON_VISUAL` の N/A 理由と代替証跡が記録されている

## サブタスク管理

1. Phase 10 成果物の確認
2. ローカル実行確認
3. 異常系確認
4. CI 検証
5. 視覚証跡 N/A 記録
6. 成果物出力
7. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
```

## 次のPhase

Phase 12: ドキュメント更新
