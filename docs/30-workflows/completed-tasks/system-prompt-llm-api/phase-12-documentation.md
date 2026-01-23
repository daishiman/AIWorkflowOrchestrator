# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 12                     |
| Phase名    | ドキュメント更新       |
| 前提Phase  | Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）     |
| ステータス | 未実施                 |
| 作成日     | 2026-01-23             |
| 機能名     | system-prompt-llm-api  |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

ドキュメント更新は以下を含む:

- 実装ガイド（概念的説明 + 技術的詳細）
- システム仕様書の更新（aiworkflow-requirements）
- 未タスク検出レポート

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成【必須】

**目的**: 実装内容を理解するためのドキュメントを作成する

**2パート構成**:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1: 概念的説明**に含める内容:

- システムプロンプトとは何か
- なぜこの機能が必要か
- どのように動作するか（図解）
- ユースケース例

**Part 2: 技術的詳細**に含める内容:

- 型定義（Message, LLMClientOptions等）
- API仕様（buildMessages, callLLM関数）
- 使用例（コードスニペット）
- エラーハンドリング

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新【必須】

**目的**: aiworkflow-requirementsを更新する

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行（両方必須確認）**:

#### Step 1: タスク完了記録【必須・全タスク】

以下のファイルを更新:

- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`

更新内容:

```markdown
## 完了タスク

### TASK-CHAT-SYSPROMPT-LLM-001（2026-01-23完了）

- システムプロンプトのLLM API統合
- buildMessages関数実装
- callLLM関数実装
- aiHandlers統合
- テストN件作成

---

## 関連ドキュメント

- [実装ガイド](../../docs/30-workflows/completed-tasks/system-prompt-llm-api/outputs/phase-12/implementation-guide.md)
```

**チェックリスト**:

- [ ] 「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**本タスクの場合**:

- `buildMessages`関数の追加 → 更新必要
- `callLLM`関数の追加 → 更新必要
- `LLMClientOptions`型の追加 → 更新必要

**更新対象**:

- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`

**チェックリスト**:

- [ ] 新規関数シグネチャを追記
- [ ] 新規型定義を追記
- [ ] 変更履歴にバージョンを追記

---

### タスク3: ドキュメント更新履歴作成【必須】

**目的**: 更新内容を記録する

**方法1: 自動生成スクリプト使用（推奨）**:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/system-prompt-llm-api
```

生成後、以下を手動で補完:

- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

**方法2: 手動作成**（フォールバック）:

```markdown
# ドキュメント更新履歴

## 更新日: 2026-01-23

### タスク情報

- タスクID: TASK-CHAT-SYSPROMPT-LLM-001
- タスク名: システムプロンプトのLLM API統合
- Issue番号: #376

### 更新内容

#### システム仕様更新

- ファイル: interfaces-llm.md
- 変更内容:
  - buildMessages関数仕様追加
  - callLLM関数仕様追加
  - LLMClientOptions型追加
  - Message型追加

#### ソースコード変更

- 新規ファイル:
  - apps/desktop/src/main/utils/buildMessages.ts
  - apps/desktop/src/main/services/llmClient.ts
- 更新ファイル:
  - apps/desktop/src/main/ipc/aiHandlers.ts
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成【必須】

**目的**: 残課題を検出し記録する

**検出ソース**:

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**方法1: 自動検出スクリプト使用（推奨）**:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/system-prompt-llm-api \
  --sources "apps/desktop/src/main/"
```

**方法2: 手動検出**（フォールバック）:

```bash
# コードベースからTODO検索
grep -r "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/
```

**レポート形式（0件の場合も出力必須）**:

```markdown
## 検出結果サマリー

| ソース         | 検出数  |
| -------------- | ------- |
| テスト結果     | 0件     |
| 発見課題       | 0件     |
| コードコメント | 0件     |
| **合計**       | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

### Phase成果物

| 資料名         | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | Phase 11成果物 |

### システム仕様

| 参照資料                | パス                                                                           | 内容     |
| ----------------------- | ------------------------------------------------------------------------------ | -------- |
| LLMインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | 更新対象 |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順 |

---

## 成果物

| 成果物               | パス                                          | 必須 | 説明                      |
| -------------------- | --------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`      | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Phase 12-2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Phase 12-2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Phase 12-2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Phase 12-2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **【Phase 12-2 Step 2】更新必要な場合：新規関数シグネチャ/型定義を追記した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                    |
| ------------------------------------- | ------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成      |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認          |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

Phase 13: PR作成

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-llm-api/phase-13-pr-creation.md`
