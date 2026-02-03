# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 12                    |
| タスク | TASK-9B-G             |
| 機能名 | skill-creator-service |
| 作成日 | 2026-02-03            |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- Task 12-1: 実装ガイド作成
- Task 12-2: システムドキュメント更新
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出

## 参照資料

| 資料名         | パス                                                                           | 説明             |
| -------------- | ------------------------------------------------------------------------------ | ---------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                       | Phase 11成果物   |
| 実装コード     | `apps/desktop/src/main/services/skill/*.ts`                                    | ドキュメント対象 |
| 仕様更新ガイド | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順         |

## 実行手順

### Task 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

#### Part 1: 概念的な説明（中学生でもわかる版）

| セクション                   | 内容                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| スキル作成って何？           | 「AIに特定の仕事をやらせるための説明書を作ること」を日常の例え（レシピ本）で説明 |
| Script Firstとは？           | 「決まりきった作業は機械にやらせる」を自動販売機の例えで説明                     |
| Progressive Disclosureとは？ | 「必要な時に必要なものだけ見る」を図書館の例えで説明                             |
| モードの違い                 | collaborative/orchestrate/createをチームワークの例えで説明                       |

#### Part 2: 技術的な詳細（開発者向け）

| セクション              | 内容                                                   |
| ----------------------- | ------------------------------------------------------ |
| 型定義                  | skillCreator.ts の全型定義とその関係                   |
| ScriptExecutor API      | execute(), executeJson() のシグネチャと使用例          |
| ResourceLoader API      | load(), loadAgent(), loadSchema() のシグネチャと使用例 |
| SkillCreatorService API | 全公開メソッドのシグネチャと使用例                     |
| エラーハンドリング      | エラーコード、エラーメッセージ、復旧手順               |
| 拡張ポイント            | 新規モード/スクリプト追加方法                          |

### Task 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加
- [ ] topic-map.mdに新規セクションエントリを追加（該当する場合）

**更新対象仕様書**:

| 仕様書                                  | 更新内容                                        |
| --------------------------------------- | ----------------------------------------------- |
| interfaces-agent-sdk-skill.md           | SkillCreatorService追加                         |
| architecture-implementation-patterns.md | Script First/Progressive Disclosureパターン追加 |

#### Step 2: システム仕様更新【条件付き】

本タスクでは以下の新規インターフェース/型が追加されるため、更新が必要：

| 更新対象             | 更新内容                                                |
| -------------------- | ------------------------------------------------------- |
| 型定義追加           | SkillCreatorMode, ExecutionEngine, CreateSkillOptions等 |
| インターフェース追加 | ScriptResult, TaskSpec, ExecutionReport等               |
| サービス追加         | ScriptExecutor, ResourceLoader, SkillCreatorService     |

### Task 12-3: ドキュメント更新履歴作成【必須】

```bash
# ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-9B-G-skill-creator-service

# Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-9B-G-skill-creator-service \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-report.md:未タスク検出レポート"
```

### Task 12-4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**想定される未タスク候補**:

- IPC通信チャンネル設定（skill:create, skill:execute等）
- UI統合（TASK-10A連携）
- Claude Agent SDK本格統合
- タイムアウト設定の外部化

## アーキテクチャ層別ドキュメント

| 層           | ドキュメント内容      | 更新対象                        |
| ------------ | --------------------- | ------------------------------- |
| Main Process | サービス設計、API仕様 | `architecture-*.md`, `api-*.md` |
| Shared       | 型定義                | `interfaces-*.md`               |

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
- [ ] **【Task 12-2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 12-2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 12-2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 12-2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 12-2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 12-2 Step 2】システム仕様更新（型定義・インターフェース追加）を完了した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                               |
| ------------------------------------- | -------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成 |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成             |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果を確認      |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2 Step 1: タスク完了記録
4. Task 12-2 Step 2: システム仕様更新
5. Task 12-3: ドキュメント更新履歴作成
6. Task 12-4: 未タスク検出
7. artifacts.json更新
8. 完了条件の検証

## 次のPhase

Phase 13: PR作成
