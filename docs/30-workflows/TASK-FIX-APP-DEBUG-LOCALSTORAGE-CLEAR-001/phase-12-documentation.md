# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 12                                        |
| Phase名    | ドキュメント                              |
| カテゴリ   | fix                                       |
| ステータス | pending                                   |
| 前提Phase  | Phase 11                                  |
| 後続Phase  | Phase 13                                  |

## 目的

実装ガイド・システム仕様更新・未タスク検出を行う。Phase 12 は漏れが最も発生しやすい Phase であるため、全項目を逐次確認する。

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 概念説明（中学生レベル）

**目的**: 中学生でも理解できる比喩を用いて、問題と修正内容を説明する

**比喩**: ゲームのセーブデータが毎回消される問題

> ゲームを起動するたびに、誰かが勝手にセーブデータを全部消してしまう仕組みが入っていました。
>
> これは開発者がテスト中に使っていた「全データリセットボタン」のようなもので、テストが終わったら外すべきものでした。しかし外し忘れたため、ゲームを開くたびにセーブデータ（設定、認証情報、アプリの状態）が消えてしまっていました。
>
> さらに悪いことに、データを消した後にゲームを強制再起動する処理も入っていたため、起動 → データ消去 → 再起動 → 正常起動 という2段階の起動になっていました。この強制再起動が、アプリの内部で「もう閉じたウィンドウを操作しようとしている」というエラーの原因になっていました。
>
> 修正は単純で、この「全データリセットボタン」のコードを削除するだけです。これにより、セーブデータは正常に保持され、強制再起動も発生しなくなります。

**成果物**: `outputs/phase-12/implementation-guide.md` Part 1

#### Part 2: 開発者向け実装詳細

**目的**: 開発者が修正内容を理解し、再発防止策を把握できるようにする

**内容**:

1. 削除対象コードの技術的説明
2. localStorage.clear() が Zustand persist に与える影響
3. window.location.reload() が Electron の WebContents ライフサイクルに与える影響
4. sessionStorage の揮発性（ウィンドウ終了時にクリア）とデバッグコードの毎回実行問題
5. 再発防止策: デバッグコードには `// TODO(cleanup): YYYY-MM-DD までに削除` のような期限付きコメントを付ける

**成果物**: `outputs/phase-12/implementation-guide.md` Part 2

### Task 2: システム仕様書更新

> **重要**: spec-update-workflow.md 準拠。全 Step を逐次確認すること。

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** - P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] 該当する場合のみ: 実装ステータス更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27 対策）

#### Step 2: システム仕様更新

- [ ] 本タスクはコード削除のみのため、アーキテクチャ変更なし。新規インターフェース追加もなし
- [ ] ただし、persist 関連の仕様書で「localStorage.clear() によるpersist状態破壊」の注意喚起を追記する場合は実施

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を**事後記録**する（P4/P51 対策: 実行前に「完了」と書かない）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（**0件でも必須**）
- [ ] 検出した未タスクは3ステップ全完了（P3 対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新

**検出候補**:

- App.tsx L72 の `console.log("🔍 [App] Initializing auth...")` の削除検討
- 他のファイルに残存するデバッグ用コードの調査

## 参照資料

| 参照資料             | パス                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| Phase 11 成果物      | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-11-manual-test.md` |
| spec-update-workflow | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`           |
| P1/P25               | `.claude/rules/06-known-pitfalls.md` (LOGS.md 2ファイル更新漏れ)                      |
| P2/P27               | `.claude/rules/06-known-pitfalls.md` (topic-map.md 再生成忘れ)                        |
| P3                   | `.claude/rules/06-known-pitfalls.md` (未タスク管理の3ステップ不完全)                  |
| P4/P51               | `.claude/rules/06-known-pitfalls.md` (早期完了記載)                                   |
| P43                  | `.claude/rules/06-known-pitfalls.md` (サブエージェント rate limit)                    |

## 統合テスト連携

- Task 2 の仕様書更新後に `git diff --stat -- .claude/skills/` で変更ファイル数を確認（P43 対策）

## 成果物

| 成果物                  | パス                                          |
| ----------------------- | --------------------------------------------- |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`    |
| documentation-changelog | `outputs/phase-12/documentation-changelog.md` |
| 未タスクレポート        | `outputs/phase-12/unassigned-task-report.md`  |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル）が作成されていること
- [ ] 実装ガイド Part 2（開発者向け）が作成されていること
- [ ] Task 2 の全 Step が完了していること（**全 Step 確認前に完了と記載しない**）
- [ ] documentation-changelog.md が作成されていること
- [ ] 未タスクレポートが作成されていること（0件でも必須）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 13: 完了へ進む。
