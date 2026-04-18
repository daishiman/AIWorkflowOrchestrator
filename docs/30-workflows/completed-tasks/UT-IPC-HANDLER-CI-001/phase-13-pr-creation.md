# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 13                                                |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 12                                          |
| 後続Phase  | -                                                 |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

全成果物を PR にまとめる準備を行う。ただし、この workflow のスコープでは commit / push / PR 作成は実行せず、blocked 理由と承認待ち状態を記録する。

## 重要事項

**このフェーズはユーザーの明示的な承認後にのみ解除する。承認がない限り blocked のまま維持し、PR 自体は作成しない。**

## 実行タスク

### Task 1: ユーザー承認状態を記録する

以下の内容を `outputs/phase-13/pr-creation-result.md` に記録する。

- user approval の有無
- blocked 理由
- PR 作成を解禁する前提条件

### Task 2: 変更サマリーを作成する

`outputs/phase-13/change-summary.md` に以下の内容をまとめる。

- 変更ファイル一覧
- 追加・変更・削除の概要
- 受け入れ基準（REG-SNAP-01, REG-DEDUP-01）の達成状況

### Task 3: ローカル品質チェック結果を整理する

PR 作成前に実行した品質チェックの結果を `outputs/phase-13/local-check-result.md` に記録する。

- `pnpm --filter @repo/desktop test`
- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop lint`

### Task 4: PR 情報の下書きを整える

`outputs/phase-13/pr-info.md` に以下を下書きする。

- PR タイトル案
- PR 本文に含めるべき項目
- テスト方法
- スナップショット更新方法
- 受け入れ基準との対応

## 参照資料

- `outputs/phase-12/` — Phase 12 成果物（実装ガイド、system spec 更新サマリー）
- `.claude/skills/task-specification-creator/references/phase-template-phase13.md`

## 実行手順

1. Phase 12 の完了根拠を確認する。
2. 変更サマリーとローカル確認結果を整理する。
3. 承認がない場合は blocked 理由を記録し、PR 情報の下書きを整える。
4. 承認がある場合のみ PR 作成手順へ進む前提条件を確認する。

## 成果物

`outputs/phase-13/` 配下に以下のファイルを作成する:

| ファイル名              | 内容             |
| ----------------------- | ---------------- |
| `change-summary.md`     | 変更サマリー     |
| `local-check-result.md` | ローカル確認結果 |
| `pr-info.md`            | PR 情報下書き    |
| `pr-creation-result.md` | blocked 記録     |

## 統合テスト連携

- Phase 10〜12 の成果物への参照を `change-summary.md` と `pr-info.md` に集約する。
- PR 未作成でも、ローカル確認と blocked 理由は Phase 13 の成果物として残す。

## 多角的チェック観点

| 観点     | 確認内容                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------- |
| 矛盾     | blocked 理由、承認状態、PR 作成可否の説明が食い違っていないか確認する                              |
| 漏れ     | 変更サマリー、ローカル確認、PR 情報下書き、blocked 記録が揃っているか確認する                      |
| 整合性   | タイトル案、受け入れ基準、参照成果物、テストコマンドが Phase 12 までの内容と一致しているか確認する |
| 依存関係 | ユーザー承認がない限り Phase 13 は blocked のままであることが明確に記録されているか確認する        |

## 完了条件

- [ ] ユーザー承認の有無が記録されている
- [ ] 承認がない場合の blocked 理由が `pr-creation-result.md` に記録されている
- [ ] `change-summary.md` と `local-check-result.md` が作成されている
- [ ] `pr-info.md` にタイトル案、本文要点、テスト方法、受け入れ基準が整理されている
- [ ] 承認がある場合のみ PR 作成へ進む条件が明記されている

## サブタスク管理

1. Phase 12 成果物の確認
2. 変更サマリー整理
3. ローカル確認結果整理
4. blocked 記録作成
5. PR 情報下書き作成
6. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した
