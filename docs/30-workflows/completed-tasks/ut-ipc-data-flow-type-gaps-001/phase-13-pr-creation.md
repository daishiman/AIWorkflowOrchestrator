# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| Phase名    | PR作成・CI確認                     |
| 前提Phase  | Phase 12（ドキュメント更新）       |
| 後続Phase  | なし（マージ準備完了）             |
| ステータス | 未実施                             |
| 作成日     | 2026-02-24                         |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001     |
| 機能名     | データフロー型ギャップ解消         |
| タスク種別 | 仕様書修正のみ（実コード変更なし） |

---

## 目的

`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行い、マージ準備を完了する。

## 背景

全ての開発フェーズが完了した後、変更をリモートリポジトリに反映する。
PR作成とCI確認により、マージ前の最終チェックを行う。

---

## 重要な注意事項

**⚠️ PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                           | 理由                                     |
| ---------------------------------- | ---------------------------------------- |
| 勝手にPRを作成する                 | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしでスキルを実行する | 意図しないブランチやコミットが作成される |
| ローカル確認をスキップする         | 確認されていない仕様書がPRに含まれる     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

- ユーザー確認: 修正済み仕様書の確認と承認を取得する
- ローカル最終確認: 変更ファイルと成果物の整合を確認する
- PR 実行判断: ユーザー許可後のみ `/ai:diff-to-pr` を実行する

### タスク1: 修正済み仕様書のユーザー確認依頼

**目的**: 修正した仕様書をユーザーに確認してもらう

**実行手順**:

1. 修正した7つの仕様書の変更内容サマリーを提示する
2. ユーザーに仕様書の内容確認を依頼する
3. ユーザーからの承認を得る

**提示内容（変更サマリーテンプレート）**:

```markdown
## 仕様書修正内容の確認

以下の7つの仕様書を修正しました。内容をご確認ください。

### 修正ファイル一覧

すべて `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` 配下:

| No  | ファイル名                               | 修正内容                                      | 対応Gap   |
| --- | ---------------------------------------- | --------------------------------------------- | --------- |
| 1   | task-020b-task-9a-skill-editor.md        | IPC引数をpositionalからオブジェクト形式に統一 | Gap 6     |
| 2   | task-022-task-9f-skill-share.md          | Date型のIPC境界注記追加, ExportResult変換追加 | Gap 1, 4  |
| 3   | task-023a-task-9g-skill-schedule.md      | Date型のIPC境界注記追加                       | Gap 1     |
| 4   | task-023b-task-9h-skill-debug.md         | Date型注記, idle状態追加, safeOnパターン追加  | Gap 1,2,5 |
| 5   | task-023d-task-9j-skill-analytics.md     | Date型のIPC境界注記追加                       | Gap 1     |
| 6   | task-030-ui-05-skill-center-view.md      | onExport引数にdocId追加, 変換ロジック記載     | Gap 3, 4  |
| 7   | task-031b-ui-05b-skill-advanced-views.md | DebugSession.statusにidle追加, safeOn記載     | Gap 2, 5  |

### 6つのGap解消状況

| Gap | 概要                                     | 対応状況 |
| --- | ---------------------------------------- | -------- |
| 1   | Date型のIPCシリアライズ問題              | ✅ 解消  |
| 2   | DebugSession.status に idle がない       | ✅ 解消  |
| 3   | DocPreview onExport 引数不整合           | ✅ 解消  |
| 4   | ExportResult → UI コールバック変換未記載 | ✅ 解消  |
| 5   | skill:debug:event の safeOn 購読未記載   | ✅ 解消  |
| 6   | task-9a のIPC引数形式統一                | ✅ 解消  |

修正後の仕様書を確認していただけますか？
```

**期待される成果物**:

- ユーザーからの確認・承認（チャット上）

---

### タスク2: ローカル確認チェック

**目的**: PR作成前に仕様書の整合性を最終確認する

**実行手順**:

本タスクは仕様書修正のみのため、コードのビルド/テストは不要。代わりに以下を確認する:

1. 修正した7つの仕様書ファイルが全て存在することを確認する
2. Markdownフォーマットが正しいことを確認する
3. Phase 12 の成果物が全て生成されていることを確認する
4. `git status` で変更ファイルが想定通りであることを確認する

**コマンド**:

```bash
# 修正ファイルの存在確認
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md
ls -la docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md

# 変更ファイルの確認
git status
git diff --stat
```

**チェックリスト**:

- [ ] 修正対象の7ファイルが全て存在する
- [ ] Phase 11-12 の成果物が全て生成されている
- [ ] 想定外の変更ファイルがない
- [ ] 機密情報が含まれていない

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク3: 変更内容の確認

**目的**: コミット対象の変更内容を最終確認する

**実行手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で差分を確認する
3. 意図しない変更がないか確認する

**確認事項**:

| 確認項目     | 確認内容                                          |
| ------------ | ------------------------------------------------- |
| 変更ファイル | 仕様書7ファイル + Phase成果物のみが変更されている |
| 機密情報     | APIキー等が含まれていない                         |
| 不要ファイル | ビルド成果物や一時ファイルが含まれていない        |
| フォーマット | Markdownのフォーマットが正しい                    |

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

---

### タスク4: ユーザー許可の取得

**目的**: PR作成の最終許可をユーザーから取得する

**実行手順**:

1. 変更内容のサマリーを提示する（タスク1の内容を更新）
2. ローカルチェック結果を提示する
3. PR作成の許可を明示的に求める
4. **許可が得られるまで次のタスクに進まない**

**提示テンプレート**:

```markdown
## PR作成確認

### ローカルチェック結果

- 仕様書7ファイル: ✅ 存在確認済み
- Phase成果物: ✅ 全て生成済み
- 変更ファイル: ✅ 想定通り
- 機密情報: ✅ なし

### 変更概要

- 仕様書修正: 7ファイル（6つのGap解消）
- Phase成果物: {{ファイル数}}ファイル
- 実コード変更: なし

PRを作成してよろしいですか？
```

**期待される成果物**:

- ユーザーからの許可（チャット上）

---

### タスク5: `/ai:diff-to-pr` 実行

**目的**: PR作成スキルを実行する

**前提条件**: タスク4でユーザーの許可が得られていること

**実行手順**:

1. ユーザーの許可を**再確認**する
2. `/ai:diff-to-pr` スキルを実行する
3. PRが作成されたことを確認する
4. PR URLを記録する

**スキル実行**:

```
/ai:diff-to-pr
```

**期待される成果物**:

- `outputs/phase-13/pr-creation-result.md`
- PR URL

---

### タスク6: CI確認・マージ準備完了報告

**目的**: CIがパスしマージ準備が完了したことを確認・報告する

**実行手順**:

1. GitHub上でCIの実行状況を確認する
2. 全CIジョブがパスすることを確認する
3. PRのレビュー準備が整ったことを報告する

**確認事項**:

| CI項目    | 期待結果 | 実際 | 備考                         |
| --------- | -------- | ---- | ---------------------------- |
| Lint      | PASS     | -    | 仕様書のみのため影響なし想定 |
| TypeCheck | PASS     | -    | 仕様書のみのため影響なし想定 |
| テスト    | PASS     | -    | 仕様書のみのため影響なし想定 |
| ビルド    | PASS     | -    | 仕様書のみのため影響なし想定 |

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク7: タスクディレクトリの移動

**目的**: 完了したタスクのディレクトリを completed-tasks へ移動する

**実行手順**:

1. PRがマージされた後（ユーザーがGitHub UIでマージ）に実行する
2. タスクディレクトリを `completed-tasks/` へ移動する

**コマンド**:

```bash
# マージ後に実行
mv docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001 docs/30-workflows/completed-tasks/
```

> **注意**: このコマンドはPRマージ後にのみ実行する。マージ前に実行しないこと。

**期待される成果物**:

- タスクディレクトリが `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/` に移動されていること

---

## 参照資料

| 参照資料              | パス                                                                                         | 内容               |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| ai:diff-to-pr スキル  | `.claude/skills/ai:diff-to-pr/`                                                              | PRスキル           |
| Phase 2 設計書        | `phase-2-design.md`                                                                          | 設計根拠           |
| Phase 5 修正結果      | `phase-5-implementation.md`                                                                  | 修正内容           |
| Phase 6 整合性検証    | `phase-6-test-expansion.md`                                                                  | 横断整合           |
| Phase 7 網羅性確認    | `phase-7-coverage-check.md`                                                                  | 網羅性             |
| Phase 8 品質改善      | `phase-8-refactoring.md`                                                                     | 品質改善内容       |
| Phase 9 品質保証      | `phase-9-quality-assurance.md`                                                               | 品質保証結果       |
| Phase 10 最終レビュー | `phase-10-final-review.md`                                                                   | 最終判定           |
| Phase 11 手動検証     | `phase-11-manual-test.md`                                                                    | 手動レビュー結果   |
| 修正対象仕様書        | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` | 修正対象7ファイル  |
| Phase 12 成果物       | `outputs/phase-12/`                                                                          | ドキュメント成果物 |

---

## 成果物

| 成果物           | パス                                     | 内容         |
| ---------------- | ---------------------------------------- | ------------ |
| ローカルチェック | `outputs/phase-13/local-check-result.md` | チェック結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更内容     |
| PR作成結果       | `outputs/phase-13/pr-creation-result.md` | PR情報       |
| CI結果           | `outputs/phase-13/ci-result.md`          | CI状況       |

---

## 完了条件

- [ ] 修正済み仕様書がユーザーに確認されている
- [ ] ローカルチェック（ファイル存在、フォーマット）が完了している
- [ ] 変更内容が確認されている
- [ ] ユーザーからPR作成の**明示的な許可**が得られている
- [ ] PRが作成されている
- [ ] CIが全てパスしている
- [ ] PR URLがユーザーに報告されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（7タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] PR URLをユーザーに報告

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（マージ準備完了）

---

## タスク完了

**⚠️ 注意**: マージはユーザーがGitHub UI上で手動で実行してください。

```markdown
## UT-IPC-DATA-FLOW-TYPE-GAPS-001: データフロー型ギャップ解消 完了

### 成果物

- 仕様書修正: 7ファイル（6つのGap解消）
- 実コード変更: なし
- Phase 1-13 全完了

### 解消したGap

| Gap | 概要                                     | 修正対象            |
| --- | ---------------------------------------- | ------------------- |
| 1   | Date型のIPCシリアライズ問題              | task-9f, 9g, 9h, 9j |
| 2   | DebugSession.status に idle がない       | task-9h, 05B        |
| 3   | DocPreview onExport 引数不整合           | 05                  |
| 4   | ExportResult → UI コールバック変換未記載 | task-9f, 05         |
| 5   | skill:debug:event の safeOn 購読未記載   | task-9h, 05B        |
| 6   | task-9a のIPC引数形式統一                | task-9a             |

### PR

- URL: {{PR_URL}}
- ステータス: マージ準備完了

### 次のステップ

- GitHub UIでPRをレビュー・マージしてください
- マージ後、タスクディレクトリを completed-tasks/ に移動してください
```
