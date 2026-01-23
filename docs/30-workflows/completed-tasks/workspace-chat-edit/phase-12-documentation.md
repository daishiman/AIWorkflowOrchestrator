# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 12                  |
| 機能名 | workspace-chat-edit |
| 作成日 | 2026-01-23          |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- **技術ドキュメント作成**: 実装ガイドの作成
- **システムドキュメント更新**: aiworkflow-requirements等の更新
- **未タスク検出**: 残課題の検出と記録

## 参照資料

| 資料名           | パス                                     | 説明           |
| ---------------- | ---------------------------------------- | -------------- |
| テスト結果       | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |
| 実装コード       | `apps/desktop/src/`                      | 実装済みコード |
| 設計ドキュメント | `outputs/phase-2/design.md`              | Phase 2成果物  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                           | 内容            |
| -------------- | ------------------------------------------------------------------------------ | --------------- |
| 仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準    |
| API設計        | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | API設計パターン |

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1の内容**:

- チャット編集機能とは何か
- どのような場面で役立つか
- 基本的な使い方の説明
- よくある質問と回答

**Part 2の内容**:

- IPC APIリファレンス（chat-edit:read-file, chat-edit:write-file等）
- Zustand Slice構造（chatEditSlice）
- UIコンポーネント設計（FileContextBadge, DiffPreview, ApplyControls）
- 統合パターンとコード例

### Phase 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記

```markdown
## 完了タスク

### タスク: workspace-chat-edit（{{COMPLETION_DATE}}完了）

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-WS-CHAT-EDIT-001        |
| ステータス | **完了**                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動） |
```

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**本機能の場合（更新必要と想定）**:

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
  - `interfaces-llm.md` - FileContext, EditCommand型追加
  - `architecture-patterns.md` - chatEditSlice追加
  - `api-endpoints.md` - chat-edit:\* IPCチャンネル追加
- 更新原則: 概要のみ記載、Single Source of Truth遵守
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

**更新チェックリスト**:

```
□ メソッドシグネチャ変更 → interfaces-*.md
□ 新規エラークラス追加 → error-handling.md
□ 新規ビジネスルール → interfaces-*.md
□ 認可/認証ロジック → interfaces-*.md / security-*.md
□ 新規定数/設定値 → 該当interfaces-*.md
□ 更新したファイルの変更履歴にバージョン追記
```

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/workspace-chat-edit \
  --sources "apps/desktop/src/"
```

**未タスク検出レポート形式（0件の場合も出力必須）**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

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

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Phase 12-1: 実装ガイド作成（Part 1: 概念的説明）
3. Phase 12-1: 実装ガイド作成（Part 2: 技術的詳細）
4. Phase 12-2 Step 1: タスク完了記録
5. Phase 12-2 Step 2: システム仕様更新判断・実行
6. Phase 12-3: 未タスク検出・レポート作成
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（テンプレート: `assets/documentation-changelog-template.md`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-report.mdを作成                       |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                   |

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/workspace-chat-edit --phase 12
```

## 次のPhase

Phase 13: PR作成
