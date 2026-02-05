# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 12                             |
| 機能名 | TASK-FIX-4-1-IPC-CONSOLIDATION |
| 作成日 | 2026-02-04                     |

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

- 日常生活での例え話を**必ず**含める（例: IPCチャンネル→電話番号のようなもの）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 図表より文章での説明を優先

**Part 1 構成テンプレート**:

```markdown
### X.X [機能名]とは何か

#### 日常生活での例え

[日常の具体的なシーン]に似ています。
例えば、[身近な例]のようなものです。

#### この機能でできること

| 機能  | 説明       | 例     |
| ----- | ---------- | ------ |
| 機能A | 簡単な説明 | 具体例 |
```

**Part 2（技術者レベル）の必須要件**:

- IPC_CHANNELS定数一覧（統合後のスキル関連チャンネル全て）
- ホワイトリスト構成（ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS）
- safeInvoke/safeOnパターンの使用例
- 移行手順（旧→新チャンネル）
- 統合前後のチャンネルマッピング表

### Task 2: システムドキュメント更新【必須】

#### Step 1-A: タスク完了記録【必須】

- [ ] `security-skill-ipc.md`に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md`にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md`にタスク完了記録を追加
- [ ] `aiworkflow-requirements/SKILL.md`の変更履歴にバージョンを追記
- [ ] `task-specification-creator/SKILL.md`の変更履歴にバージョンを追記

#### Step 1-B: 実装状況テーブル更新【必須】

- [ ] `security-skill-ipc.md`のIPCチャンネル定義テーブルを更新
- [ ] `interfaces-agent-sdk-skill.md`のIPC仕様テーブルを更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] 関連タスクテーブルのステータスを「完了」に更新（該当する場合）
- [ ] `grep -rn "TASK-FIX-4-1" .claude/skills/aiworkflow-requirements/references/`で全箇所を確認

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

本タスクはリファクタリングであり、インターフェース変更なし → **更新不要**

| 更新必要                    | 更新不要（本タスク）   |
| --------------------------- | ---------------------- |
| 新規インターフェース/型追加 | ✓ 内部実装の変更のみ   |
| 既存インターフェース変更    | ✓ チャンネル名統一のみ |
| 新規定数/設定値追加         | ✓ 既存定数の整理       |

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する。

**手動作成（スクリプト未存在時）**:

- `outputs/phase-12/documentation-changelog.md` を作成
- `artifacts.json` を手動作成

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
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/ --include="*.ts" | grep -v "test"
```

## 参照資料

| 資料名                 | パス                                      | 説明             |
| ---------------------- | ----------------------------------------- | ---------------- |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md` | Phase 10成果物   |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物   |
| 実装ガイドテンプレート | `assets/implementation-guide-template.md` | テンプレート参照 |
| 仕様更新ワークフロー   | `references/spec-update-workflow.md`      | Step詳細手順     |

## アーキテクチャ層別ドキュメント

実装ガイドPart 2で以下の層別にドキュメントを作成する:

| 層      | ドキュメント内容                   | 更新対象                        |
| ------- | ---------------------------------- | ------------------------------- |
| Preload | チャンネル定義、ホワイトリスト構成 | `security-skill-ipc.md`         |
| IPC通信 | チャンネル一覧、通信方向           | `interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
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
