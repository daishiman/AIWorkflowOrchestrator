# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 12                                  |
| Phase名   | ドキュメント更新                    |
| カテゴリ  | 文書化                              |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 11                            |
| 後続Phase | Phase 13                            |

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

- 日常生活での例え話を**必ず**含める（例: ChatPanelは「仕事の相棒」、SkillSelectorは「道具箱」、PermissionDialogは「確認のドア」）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- ストリーミング表示を「手紙が1文字ずつ届く」のように例える

**Part 2（技術者レベル）の必須要件**:

- ChatPanelの統合アーキテクチャ（コンポーネント階層図）
- SkillStreamingViewのTypeScriptインターフェース/型定義
- 各サブコンポーネント（StatusBadge, StreamMessageItem, ToolExecutionHistory）のAPI仕様
- Store接続パターン（useAppStoreからの状態取得）
- アクセシビリティ実装の詳細（aria-live, role, フォーカス管理）
- テスト戦略と主要テストケース

**期待される成果物**:

- 実装ガイド（`outputs/phase-12/implementation-guide.md`）

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**Step 1-A: タスク完了記録【必須】**

- [ ] `interfaces-agent-sdk-ui.md` に完了タスクセクションを追加する

  ```markdown
  ### タスク: TASK-7D ChatPanel統合（{{COMPLETION_DATE}}完了）

  | 項目       | 内容                      |
  | ---------- | ------------------------- |
  | タスクID   | TASK-7D                   |
  | ステータス | **完了**                  |
  | テスト数   | {{N}}（自動）+ 17（手動） |
  ```

- [ ] `interfaces-agent-sdk-ui.md` の関連ドキュメントセクションに実装ガイドリンクを追加する
- [ ] `interfaces-agent-sdk-ui.md` の変更履歴セクションにバージョンを追記する
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加する
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加する
- [ ] `topic-map.md` に新規セクションエントリを追加する（ChatPanel統合）

**Step 1-B: 実装状況テーブル更新【必須】**

- [ ] `arch-state-management.md` のTASK-7Dステータスを「完了」に更新する
- [ ] `interfaces-agent-sdk-ui.md` の実装状況テーブルを更新する

**Step 1-C: 関連タスクテーブル更新【必須】**

- [ ] `arch-state-management.md` の関連タスクテーブルでTASK-7Dを「完了」に更新する
- [ ] `interfaces-agent-sdk-history.md` にTASK-7D完了記録を追加する

**Step 2: システム仕様更新【条件付き】**

ChatPanel統合によりインターフェース変更が発生するため、以下を更新する:

- [ ] `interfaces-agent-sdk-ui.md` にChatPanel統合仕様セクションを追加する
  - ChatPanelのコンポーネント階層
  - SkillStreamingViewのProps仕様
  - 状態管理パターン（skillSlice経由）
- [ ] `ui-ux-agent-execution.md` にChatPanel統合UIフローを追記する

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

**手順**:

1. ドキュメント更新履歴（`outputs/phase-12/documentation-changelog.md`）を作成する
2. artifacts.jsonを更新する

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-7D-chatpanel-agent-integration

# Step 2: Phase 12完了登録
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-7D-chatpanel-agent-integration \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

### Task 4: 未タスク検出【必須】

0件でも出力必須。

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案     |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-detection.md`）
- 未完了タスク指示書（検出時のみ `docs/30-workflows/unassigned-task/*.md`）

## アーキテクチャ層別ドキュメント

| 層               | ドキュメント内容                            | 更新対象                     |
| ---------------- | ------------------------------------------- | ---------------------------- |
| Renderer Process | コンポーネント設計、状態管理、Hooks使用方法 | `interfaces-agent-sdk-ui.md` |
| 状態管理         | skillSliceセレクター、Store接続パターン     | `arch-state-management.md`   |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】** `interfaces-agent-sdk-ui.md`に完了タスクセクションを追加した
- [ ] **【Task 2 Step 1-A】** 関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] **【Task 2 Step 1-A】** 変更履歴セクションにバージョンを追記した
- [ ] **【Task 2 Step 1-A】** aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した
- [ ] **【Task 2 Step 1-A】** task-specification-creator/LOGS.mdにタスク完了記録を追加した
- [ ] **【Task 2 Step 1-A】** topic-map.mdに新規セクションエントリを追加した（該当する場合）
- [ ] **【Task 2 Step 1-B】** `arch-state-management.md`のTASK-7Dステータスを「完了」に更新した
- [ ] **【Task 2 Step 1-C】** 関連タスクテーブルのステータスを「完了」に更新した
- [ ] **【Task 2 Step 2】** `interfaces-agent-sdk-ui.md`にChatPanel統合仕様を追加した
- [ ] **【Task 2 Step 2】** `ui-ux-agent-execution.md`にChatPanel統合UIフローを追記した
- [ ] **【Task 2 Step 2】** システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] 未タスク検出レポートが出力されている【必須・0件でも出力】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] 本Phase内の全タスクを100%実行完了

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認                                                                          |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 1: 実装ガイド作成（Part 1 + Part 2）
2. Task 2 Step 1-A: タスク完了記録
3. Task 2 Step 1-B: 実装状況テーブル更新
4. Task 2 Step 1-C: 関連タスクテーブル更新
5. Task 2 Step 2: システム仕様更新
6. Task 3: ドキュメント更新履歴 & artifacts.json更新
7. Task 4: 未タスク検出
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 12
```

## 次のPhase

Phase 13: PR作成 → [phase-13-pr-creation.md](phase-13-pr-creation.md)
