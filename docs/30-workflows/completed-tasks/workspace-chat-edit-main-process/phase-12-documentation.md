# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| Phase        | 12                                         |
| 名称         | ドキュメント更新                           |
| 目的         | ドキュメント更新・仕様反映・未タスク検出   |
| 前提Phase    | Phase 11（手動テスト検証）                 |
| 成果物       | 実装ガイド、更新履歴、未タスク検出レポート |
| 成果物配置先 | `outputs/phase-12/`                        |

---

## 1. 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 2. 実行タスク

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明

```markdown
# Workspace Chat Edit Main Process - 実装ガイド

## Part 1: 概念的説明（初学者向け）

### 何ができるようになるか

この機能により、エディタで選択したコードをAIが編集できるようになります。
「続きを書いて」「リファクタリングして」などの指示を出すと、
AIがコードを生成して返してくれます。

### 仕組みの概要

1. ユーザーがエディタでコードを選択
2. 「続きを書いて」などの指示を入力
3. 裏側で選択したコードをAIに送信
4. AIが生成したコードを受け取る
5. 差分を表示して確認
6. 適用するかどうかを選択

### 主要な部品

- **FileService**: ファイルを読み書きする担当
- **ContextBuilder**: AIに送る情報を組み立てる担当
- **ChatEditService**: AIとやり取りする担当
- **IPCハンドラ**: 画面と裏側をつなぐ通信担当
```

#### Part 2: 技術的詳細

```markdown
## Part 2: 技術的詳細（開発者向け）

### アーキテクチャ

[Phase 2の設計書を参照]

### API仕様

#### FileService

| メソッド       | 引数                       | 戻り値          |
| -------------- | -------------------------- | --------------- |
| readFile       | filePath: string           | FileReadResult  |
| writeFile      | filePath, content, options | FileWriteResult |
| detectLanguage | filePath: string           | string          |

#### ContextBuilder

| メソッド      | 引数               | 戻り値  |
| ------------- | ------------------ | ------- |
| build         | FileContextInput[] | string  |
| calculateSize | FileContextInput[] | number  |
| validateSize  | FileContextInput[] | boolean |

#### ChatEditService

| メソッド        | 引数                   | 戻り値                  |
| --------------- | ---------------------- | ----------------------- |
| sendWithContext | SendWithContextRequest | SendWithContextResponse |

### 使用例

[コード例を記載]
```

---

### Phase 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

以下のチェックリストを必ず実行:

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記

**追加するセクション例**:

```markdown
## 完了タスク

### タスク: Workspace Chat Edit Main Process（YYYY-MM-DD完了）

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | TASK-WCE-MAIN-001      |
| Issue      | #469                   |
| ステータス | **完了**               |
| テスト数   | XX（自動）+ XX（手動） |

## 関連ドキュメント

- [実装ガイド](outputs/phase-12/implementation-guide.md)
```

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**本タスクの判断**:

| 変更内容                                   | 該当仕様書               | 更新要否     | 更新内容                            |
| ------------------------------------------ | ------------------------ | ------------ | ----------------------------------- |
| chat-edit IPCチャンネル実装完了            | api-endpoints.md         | **更新必要** | 実装状況を「未実装」→「完了」に変更 |
| FileService/ContextBuilder/ChatEditService | interfaces-llm.md        | **更新必要** | サービスインターフェース追加        |
| validateIpcSender使用パターン              | security-api-electron.md | 確認のみ     | 既存パターンに準拠（更新不要）      |

**更新対象ファイル（必須）**:

1. `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`
   - 「Workspace Chat Edit IPC チャネル」セクションの実装状況テーブルを更新
   - 完了タスクセクションを追加

2. `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`（または新規ファイル作成）
   - FileService インターフェース追加
   - ContextBuilder インターフェース追加
   - ChatEditService インターフェース追加

**更新内容詳細**:

```markdown
## api-endpoints.md 更新箇所

### 実装状況テーブル更新

| 項目                 | 状態     | 備考                                               |
| -------------------- | -------- | -------------------------------------------------- |
| 型定義               | 完了     | types/index.ts                                     |
| chatEditSlice        | 完了     | Zustand状態管理                                    |
| useFileContext       | 完了     | ファイルコンテキストHook                           |
| useDiffApply         | 完了     | 差分適用Hook                                       |
| UIコンポーネント     | 未実装   | 別タスク（task-workspace-chat-edit-ui-components） |
| Main Processサービス | **完了** | FileService, ContextBuilder, ChatEditService       |
| IPCハンドラー        | **完了** | chatEditHandlers.ts                                |

### 完了タスクセクション追加

## 完了タスク

### Workspace Chat Edit Main Process（YYYY-MM-DD完了）

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| ステータス   | **完了**                                                       |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | XX（自動）+ XX（手動）                                         |
| ドキュメント | `docs/30-workflows/workspace-chat-edit-main-process/`          |
```

**更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

---

### Phase 12-3: 未タスク検出【必須】

#### 検出ソース

| #   | ソース                   | 確認項目                                         |
| --- | ------------------------ | ------------------------------------------------ |
| 1   | Phase 3レビュー結果      | MINOR判定の指摘事項                              |
| 2   | Phase 10レビュー結果     | MINOR判定の指摘事項                              |
| 3   | Phase 11手動テスト結果   | スコープ外の発見事項                             |
| 4   | 各Phase成果物            | 「将来対応」「TODO」「FIXME」                    |
| 5   | コードベース             | TODO/FIXME/HACK/XXXコメント                      |
| 6   | **スキル改善候補**       | 今回使用したスキルの改善点                       |
| 7   | **関連UIコンポーネント** | UT-WCE-001（UIコンポーネント実装）のブロック解除 |

#### スキル更新チェック【重要】

本タスクで使用したスキルに対する改善候補を検出:

| スキル                     | チェック項目                                            | 更新要否 |
| -------------------------- | ------------------------------------------------------- | -------- |
| task-specification-creator | テンプレート/ワークフローの改善点発見                   | -        |
| aiworkflow-requirements    | Phase 12-2で更新予定（api-endpoints.md, interfaces-\*） | **必須** |

#### 関連タスクのブロック解除

本タスク完了により、以下の関連タスクがブロック解除される:

| タスク名                            | タスクID   | 依存内容                      |
| ----------------------------------- | ---------- | ----------------------------- |
| Workspace Chat Edit UI Components   | UT-WCE-001 | Main Process側IPCハンドラ完成 |
| ※未タスク指示書を作成する場合は明記 | -          | -                             |

#### 検出コマンド

```bash
# コードベースからTODO/FIXME検出
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/workspace-chat-edit-main-process \
  --sources "apps/desktop/src/main/services/chat-edit/,apps/desktop/src/main/ipc/"
```

#### 検出レポート形式（0件の場合も出力必須）

```markdown
# 未タスク検出レポート

## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| Phase 3レビュー  | X件     |
| Phase 10レビュー | X件     |
| Phase 11テスト   | X件     |
| コードベース     | X件     |
| **合計**         | **X件** |

## 検出タスク一覧

### 【0件の場合】

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。

### 【検出ありの場合】

| #   | タスク名     | ソース   | 優先度   | 対応時期 |
| --- | ------------ | -------- | -------- | -------- |
| 1   | [タスク内容] | [検出元] | 高/中/低 | [時期]   |
```

---

## 3. 参照資料

### 3.1 システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |
| APIエンドポイント       | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`           |
| インターフェース（LLM） | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          |

### 3.2 前Phase成果物

| Phase | 成果物                  | パス                |
| ----- | ----------------------- | ------------------- |
| 3     | design-review-result.md | `outputs/phase-3/`  |
| 10    | final-review.md         | `outputs/phase-10/` |
| 11    | manual-test-report.md   | `outputs/phase-11/` |

---

## 4. 成果物

| 成果物                     | 配置先                               | 必須 | 説明                      |
| -------------------------- | ------------------------------------ | ---- | ------------------------- |
| implementation-guide.md    | `outputs/phase-12/`                  | ✅   | 概念的+技術的ドキュメント |
| documentation-changelog.md | `outputs/phase-12/`                  | ✅   | 更新履歴                  |
| unassigned-task-report.md  | `outputs/phase-12/`                  | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書         | `docs/30-workflows/unassigned-task/` | 条件 | 検出時のみ作成            |

---

## 5. 完了条件

### Phase 12-1 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている

### Phase 12-2 完了条件

- [ ] **【Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**

### Phase 12-3 完了条件

- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

### 全体完了条件

- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 6. フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                         |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-report.mdを作成 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                             |

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 実装ガイド Part 1 作成（Phase 12-1）
2. 実装ガイド Part 2 作成（Phase 12-1）
3. タスク完了記録（Phase 12-2 Step 1）
4. システム仕様更新判断・実行（Phase 12-2 Step 2）
5. 未タスク検出レポート作成（Phase 12-3）
6. documentation-changelog.md作成
7. artifacts.json更新
8. 完了条件の検証

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 12
```

---

## 9. 次のPhase

Phase 13: PR作成
