# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 12                                   |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- **技術ドキュメント作成**: 実装ガイドの作成
- **システムドキュメント更新**: aiworkflow-requirements等の更新
- **未タスク検出**: 残課題の検出と記録

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明

```markdown
# 会話履歴永続化機能とは

## 簡単な説明

アプリを閉じても、今までのAIとの会話が消えずに残る機能です。
次にアプリを開いたとき、前回の会話の続きができます。

## どうやって動いているの？

1. あなたがメッセージを送ると、アプリは自動的にそれを保存します
2. 保存先は、あなたのパソコンの中にある特別なファイル（データベース）です
3. アプリを閉じて再び開くと、保存されていた会話を読み込んで表示します
```

#### Part 2: 技術的詳細

```markdown
# 会話履歴永続化 - 技術実装ガイド

## アーキテクチャ

- Repository層: ConversationRepository（SQLiteアクセス）
- IPC層: conversation:\*チャンネル（7種類）
- 状態管理: Redux Toolkit（llmSlice拡張）

## 主要API

- listConversations(userId, options)
- getConversation(id)
- createConversation(data)
- updateConversation(id, data)
- deleteConversation(id)
- addMessage(sessionId, message)
- searchConversations(userId, query)
```

### Phase 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記

更新対象:

- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- `.claude/skills/aiworkflow-requirements/references/database-schema.md`

追記内容:

```markdown
## 完了タスク

### タスク: 会話履歴の永続化（2026-01-XX完了）

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | UT-LLM-HISTORY-001     |
| ステータス | **完了**               |
| テスト数   | XX（自動）+ XX（手動） |

## 関連ドキュメント

- [会話履歴永続化 実装ガイド](../../../docs/30-workflows/llm-conversation-history-persistence/outputs/phase-12/implementation-guide.md)
```

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

本タスクでの更新対象:

| 更新ファイル       | 更新内容                                         |
| ------------------ | ------------------------------------------------ |
| interfaces-llm.md  | Conversation型、IPC契約（conversation:\*）を追加 |
| database-schema.md | chat_sessions/chat_messages実装状況を更新        |

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

## 成果物

| 成果物               | パス                                          | 必須 | 説明                      |
| -------------------- | --------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`      | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Phase 12-2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Phase 12-2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Phase 12-2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Phase 12-2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                    |
| ------------------------------------- | ------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成      |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認          |

## 次のPhase

Phase 13: PR作成
