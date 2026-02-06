# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 12                                   |
| 機能名 | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日 | 2026-02-07                           |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を**必ず**含める（例: 永続化→ノートにメモを書いて次回に読み返す）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 図表より文章での説明を優先

**Part 1 構成テンプレート**:

```markdown
### X.X スキル永続化とは何か

#### 日常生活での例え

図書館で借りた本のリストを紙にメモしておくようなものです。
メモしておけば、次に図書館に行ったとき、前回どの本を借りたか思い出せます。
アプリも同じで、インポートしたスキルをファイルに保存しておけば、
次回アプリを開いたときにスキルを覚えていてくれます。

#### この機能でできること

| 機能       | 説明                                 | 例                         |
| ---------- | ------------------------------------ | -------------------------- |
| スキル保存 | インポートしたスキルをファイルに保存 | スキルを追加したら自動保存 |
| スキル復元 | アプリ起動時に保存済みスキルを読込   | 再起動後もスキルが残る     |
| エラー回復 | ファイルが壊れても安全に起動         | 壊れた場合は空から再開     |
```

**Part 2（技術者レベル）の必須要件**:

- electron-store の設定と初期化
- 保存データのスキーマ定義
- SkillImportManager の永続化フロー
- エラーハンドリングとフォールバック戦略
- デバッグ方法（保存ファイルの場所、ログ確認方法）

### Task 2: システムドキュメント更新【必須】

#### Step 1-A: タスク完了記録【必須】

- [ ] `technical-decisions.md` に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md`にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md`にタスク完了記録を追加
- [ ] `aiworkflow-requirements/SKILL.md`の変更履歴にバージョンを追記
- [ ] `task-specification-creator/SKILL.md`の変更履歴にバージョンを追記

#### Step 1-B: 実装状況テーブル更新【必須】

- [ ] `technical-decisions.md` §3 の永続化設計セクションに実装ステータスを追記
- [ ] GitHub Issue #418（SKILL-STORE-001）のステータスを更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] 関連タスクテーブルのステータスを「完了」に更新（該当する場合）
- [ ] `grep -rn "TASK-FIX-4-2" .claude/skills/aiworkflow-requirements/references/`で全箇所を確認

#### Step 1-D: topic-map.md再生成【必須】

仕様書にセクション追加・行数変更があった場合、行番号を再同期する。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] generate-index.jsを実行して`topic-map.md`を再生成

#### Step 1-E: 未タスク指示書作成・登録（検出時は必須）

Task 4で1件以上検出した場合：

- [ ] `docs/30-workflows/unassigned-task/` に指示書を作成・配置
- [ ] 関連仕様書の残課題テーブルに新規未タスクを登録

#### Step 2: システム仕様更新【条件付き】

本タスクはバグ修正であり、インターフェース変更なし → **基本的に更新不要**

| 更新必要                    | 更新不要（本タスク）             |
| --------------------------- | -------------------------------- |
| 新規インターフェース/型追加 | 既存の永続化設計に基づく実装修正 |
| 既存インターフェース変更    | 内部ロジックの修正のみ           |
| 新規定数/設定値追加         | 既存設定の正しい適用             |

ただし、修正内容により設計書への注記が必要な場合は追記する。

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する。

**手動作成（スクリプト未存在時）**:

- `outputs/phase-12/documentation-changelog.md` を作成
- `artifacts.json` を手動作成

**documentation-changelog.md 記載内容**:

| 項目         | 内容                   |
| ------------ | ---------------------- |
| 更新日       | 2026-02-07             |
| 更新者       | Claude Code            |
| Step 1-A完了 | [実行結果を記載]       |
| Step 1-B完了 | [実行結果を記載]       |
| Step 1-C完了 | [実行結果を記載]       |
| Step 1-D完了 | [実行結果を記載]       |
| Step 1-E完了 | [検出件数と対応を記載] |
| Step 2判断   | [更新要否と理由を記載] |

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出コマンド**:

```bash
# 関連ファイルのTODO/FIXME検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/ --include="*.ts" | grep -v "test"
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/skillHandlers.ts
```

**未タスク検出レポートの必須項目**:

- 検出件数（0件の場合も明記）
- 各項目の詳細（検出した場合）
- 対応方針

## 参照資料

| 資料名                 | パス                                      | 説明             |
| ---------------------- | ----------------------------------------- | ---------------- |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md` | Phase 10成果物   |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物   |
| 実装ガイドテンプレート | `assets/implementation-guide-template.md` | テンプレート参照 |
| 仕様更新ワークフロー   | `references/spec-update-workflow.md`      | Step詳細手順     |
| 永続化設計書           | `technical-decisions.md` §3               | 設計仕様         |

## アーキテクチャ層別ドキュメント

実装ガイドPart 2で以下の層別にドキュメントを作成する:

| 層      | ドキュメント内容                     | 更新対象                 |
| ------- | ------------------------------------ | ------------------------ |
| Main    | electron-store設定、初期化タイミング | `technical-decisions.md` |
| Service | SkillImportManagerの永続化フロー     | 実装ガイド               |
| IPC     | skill:getImportedの動作仕様          | 実装ガイド               |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | YES  | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | YES  | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | YES  | 検出結果（0件でも出力）   |
| 未完了タスク指示書   | `../unassigned-task/*.md`                       | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.mdの変更履歴を更新した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.mdの変更履歴を更新した**
- [ ] **【Task 2 Step 1-B】実装状況テーブルを更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】generate-index.jsを実行してtopic-map.mdを再生成した**
- [ ] **【Task 2 Step 1-E】未タスク指示書を作成・登録した（検出時のみ）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
