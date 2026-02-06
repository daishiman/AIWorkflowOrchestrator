# TASK-FIX-5-1: 未タスク検出レポート

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 検出日   | 2026-02-06                         |

## 検出ソース

| #   | ソース               | 確認項目                           | 検出数 |
| --- | -------------------- | ---------------------------------- | ------ |
| 1   | 元タスク仕様書       | 「スコープ外」として明示された項目 | 1件    |
| 2   | Phase 3レビュー結果  | MINOR判定の指摘事項                | 0件    |
| 3   | Phase 10レビュー結果 | MINOR判定の指摘事項                | 1件    |
| 4   | Phase 11手動テスト   | スコープ外の発見事項               | 0件    |
| 5   | コードベース         | TODO/FIXME/HACK/XXXコメント        | 1件    |

## 検出された未タスク

### UT-FIX-5-1-001: AgentView型アサーション解消

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| 検出元   | Phase 10 MINOR + コードベースTASK-FIX-5-1コメント                                         |
| 概要     | AgentViewの `as unknown as Skill[]` 型アサーション解消                                    |
| 対象     | `apps/desktop/src/renderer/views/AgentView/index.tsx` (L150, L167)                        |
| 理由     | agentSliceが `Skill` 型を使用しているが、統一APIは `SkillMetadata`/`ImportedSkill` を返す |
| 対処方針 | agentSliceの型定義を `SkillMetadata`/`ImportedSkill` に移行                               |
| 優先度   | 中（型安全性向上、実行時影響なし）                                                        |
| 関連     | TASK-FIX-6-1（状態管理変更）で実施予定                                                    |

### 既存TODO（本タスクスコープ外）

以下のTODOは本タスク以前から存在し、TASK-FIX-5-1のスコープ外です:

| ファイル                           | TODO内容                                 | 備考                 |
| ---------------------------------- | ---------------------------------------- | -------------------- |
| `store/setupSkillListeners.ts:23`  | TASK-7Dで型定義統一                      | 既存タスクで対応予定 |
| `App.tsx:27`                       | デバッグ用ストレージクリア削除           | 既存技術的負債       |
| `community-integration.test.tsx`   | UIコンポーネント実装不一致 (4件)         | 既存テスト負債       |
| `CommunityVisualization/index.tsx` | CONV-08-06でエンティティ詳細画面遷移実装 | 既存タスクで対応予定 |
| `AuthErrorBoundary.tsx`            | エラーレポーティングサービス送信         | 既存技術的負債       |
| `devMockAuth.ts`                   | 認証機能復活時に削除                     | 既存技術的負債       |

## 3ステップ完了チェック

### UT-FIX-5-1-001

- [x] Step 1: 未タスクレポート（本ドキュメント）に記載
- [x] Step 2: `task-workflow.md` 残課題テーブルに UT-FIX-5-1-001 を登録済み
- [x] Step 3: `docs/30-workflows/unassigned-task/task-ut-fix-5-1-001-agentview-type-assertion.md` に指示書を作成済み、`interfaces-agent-sdk-skill.md` の完了タスク備考に記載済み

## サマリ

| 項目                   | 件数    |
| ---------------------- | ------- |
| 新規未タスク検出       | 1件     |
| 既存タスクで対応予定   | 2件     |
| 既存技術的負債         | 3件     |
| 既存テスト負債         | 4件     |
| **要対応（新規のみ）** | **1件** |
