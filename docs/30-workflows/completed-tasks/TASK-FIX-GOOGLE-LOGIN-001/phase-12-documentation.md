# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 12               |
| Phase名    | ドキュメント更新 |
| 前提Phase  | Phase 11         |
| 後続Phase  | Phase 13         |
| ステータス | 未実施           |
| 作成日     | 2026-02-04       |
| 機能名     | google-login-fix |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

手動テストが完了した状態で、実装内容のドキュメント化と、発見された課題の未タスク化を行う。

---

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 2（技術者レベル）の必須要件**:

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**テンプレート**: `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

---

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**4サブステップで実行**（全て必須確認）:

#### Step 1-A: タスク完了記録【必須】

> ⚠️ **必須**: `spec-update-workflow.md`の「タスク完了ステータス更新」詳細テンプレート（テスト結果サマリー表・成果物表）を使用すること

- [ ] 該当する仕様書に「完了タスク」セクションを追加（詳細テンプレート形式）
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加

#### Step 1-B: 実装状況テーブル更新【必須】

- [ ] interfaces-auth.md等の実装状況を「完了」に更新

#### Step 1-C: 関連タスクテーブル更新【該当する場合】

- [ ] `grep -rn "TASK-FIX-GOOGLE-LOGIN" references/` でタスク記載箇所を検索
- [ ] 関連タスクテーブルのステータスを「完了」に更新

#### Step 1-D: topic-map.md再生成【必須】

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行
- [ ] 新規セクションの行番号が正しく反映されていることを確認

#### Step 1-E: 未タスク指示書作成・登録【1件以上検出時は必須】

- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成
- [ ] `task-workflow.md` の残課題テーブルに新規未タスクを登録
- [ ] 関連仕様書の残課題テーブルに新規未タスクを登録

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**更新対象**:

- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する。

**documentation-changelog.md記録要件**:

全Step（1-A/1-B/1-C/1-D/1-E/Step 2）の結果を個別に明記する:

| Step     | 記録内容                                 |
| -------- | ---------------------------------------- |
| Step 1-A | ✅/❌ + 更新した仕様書・セクション       |
| Step 1-B | ✅/該当なし + 更新した実装状況テーブル   |
| Step 1-C | ✅/該当なし + 更新した関連タスクテーブル |
| Step 1-D | ✅ + topic-map.md再生成確認              |
| Step 1-E | ✅/該当なし + 作成した未タスク指示書     |
| Step 2   | ✅/更新不要 + 理由・更新内容             |

---

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

---

## 参照資料

| 参照資料             | パス                                                                           | 内容           |
| -------------------- | ------------------------------------------------------------------------------ | -------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                       | Phase 11成果物 |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順       |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`         | 更新対象       |

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

---

## アーキテクチャ層別ドキュメント

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する：

| 層                 | ドキュメント内容                       | 更新対象                        |
| ------------------ | -------------------------------------- | ------------------------------- |
| Renderer Process   | authSlice改善、リスナー管理            | `ui-ux-*.md`                    |
| Main Process       | callback処理、authHandlers、設定検証   | `architecture-auth-security.md` |
| IPC通信            | AUTH_STATE_CHANGEDペイロード拡張       | `api-ipc-auth.md`               |
| エラーハンドリング | AUTH_ERROR_CODES拡張、エラーメッセージ | `error-handling.md`             |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-B】実装状況テーブルを「完了」に更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成し行番号を同期した**
- [ ] **【Task 2 Step 1-E】未タスク指示書を作成・配置した（1件以上検出時）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/phase-13-pr-creation.md`
