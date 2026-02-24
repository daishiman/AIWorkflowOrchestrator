# UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の解消

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                     |
| タイトル   | skill:import IPCチャネル名競合の解消                     |
| ステータス | spec_created                                             |
| 優先度     | high                                                     |
| 複雑度     | medium                                                   |
| Tier       | 3                                                        |
| 依存タスク | TASK-9F                                                  |
| タグ       | backend, ipc, skill-management, channel-naming, security |
| 作成日     | 2026-02-24                                               |

## 概要

既存の `skill:import` チャネル（ローカルスキルインポート、引数: `string`）と TASK-9F で新規定義される `skill:import` チャネル（外部ソースインポート、引数: `ShareTarget`）の名前競合を、**仕様書修正のみ**で事前に解消する予防的タスク。

## タスクの性質

**本タスクは仕様書（Markdown）の修正のみを行い、コード変更は含まない。** TASK-9F の外部インポート用チャネルを `skill:importFromSource` に改名し、IPC テーブルを整合させる。

## スコープ

### 含むもの

- task-022-task-9f-skill-share.md の Step 3 チャネル名修正（`skill:import` → `skill:importFromSource`）
- 05-skill-center-view.md のセクション 15B.2 IPC テーブル修正
- 05-skill-center-view.md のセクション 11 IPC 連携テーブルに 3 チャネル追加
- task-022-task-9f-skill-share.md の artifacts.modifies に `channels.ts` 追加

### 含まないもの

- 既存の `skill:import` ハンドラの変更（変更不要）
- TASK-9F の実装自体（本タスクは仕様書修正のみ）
- channels.ts / skill-api.ts / preload/types.ts の実コード変更（TASK-9F 実装時に行う）

## Phase 構成

| Phase | 名称             | 目的                               | 適用 |
| ----- | ---------------- | ---------------------------------- | ---- |
| 1     | 要件定義         | 仕様書修正の要件と受入基準の定義   | ✅   |
| 2     | 設計             | 修正対象箇所の特定と修正方針の設計 | ✅   |
| 3     | 設計レビュー     | 修正方針の妥当性検証               | ✅   |
| 4     | テスト作成       | grep による整合性検証の設計        | ✅   |
| 5     | 実装             | Markdown 仕様書の修正実行          | ✅   |
| 6     | テスト拡充       | N/A（コード変更なし）              | ⚠️   |
| 7     | カバレッジ確認   | N/A（コード変更なし）              | ⚠️   |
| 8     | リファクタリング | N/A（コード変更なし）              | ⚠️   |
| 9     | 品質保証         | 全仕様書の grep 整合性確認         | ✅   |
| 10    | 最終レビュー     | 修正内容の最終確認                 | ✅   |
| 11    | 手動テスト       | 目視による仕様書整合性確認         | ✅   |
| 12    | ドキュメント     | タスク完了記録・システム仕様書更新 | ✅   |
| 13    | PR作成           | 変更のコミット・PR作成             | ✅   |

> ⚠️ Phase 6-8 は仕様書修正のみタスクのため、「該当なし」として理由を記録する。

## 修正対象ファイル

| ファイル       | パス                                                                                                                            | 修正内容                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| task-9f 仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     | Step 3 チャネル名修正 + artifacts.modifies 追加 |
| 05 UI仕様書    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` | セクション 11 + 15B.2 の IPC テーブル修正       |

## 参照資料

| 資料名           | パス                                                                                                                                         | 説明                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 元タスク仕様書   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010-ut-skill-import-channel-conflict-001.md` | タスク定義                                   |
| P5（二重登録）   | `.claude/rules/06-known-pitfalls.md#P5`                                                                                                      | ipcMain.handle() 二重登録例外                |
| P44（IPC不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                                                                     | IPCハンドラとPreloadのインターフェース不整合 |

## Phase 仕様書一覧

| Phase | ファイル名                     |
| ----- | ------------------------------ |
| 1     | `phase-1-requirements.md`      |
| 2     | `phase-2-design.md`            |
| 3     | `phase-3-design-review.md`     |
| 4     | `phase-4-test-creation.md`     |
| 5     | `phase-5-implementation.md`    |
| 6     | `phase-6-test-expansion.md`    |
| 7     | `phase-7-coverage-check.md`    |
| 8     | `phase-8-refactoring.md`       |
| 9     | `phase-9-quality-assurance.md` |
| 10    | `phase-10-final-review.md`     |
| 11    | `phase-11-manual-test.md`      |
| 12    | `phase-12-documentation.md`    |
| 13    | `phase-13-pr-creation.md`      |

## aiworkflow-requirements 抽出結果（本タスクで必須）

`aiworkflow-requirements/indexes/resource-map.md` を起点に、`search-spec.js`（キーワード: `skill:import`, `IPCチャネル`）で候補仕様を列挙し、今回タスク（IPCチャネル名競合の予防的解消）で必要な情報を採否判定した。

| 区分 | カテゴリ                  | 抽出した仕様ファイル                      | 本タスクでの用途                                               |
| ---- | ------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| 必須 | API設計（IPC）            | `api-ipc-agent.md`                        | Skill管理系IPCチャネルの契約確認（既存 `skill:import` の正本） |
| 必須 | インターフェース          | `interfaces-agent-sdk-skill.md`           | Renderer/Preload/MainのSkill API契約の整合確認                 |
| 必須 | IPCセキュリティ           | `security-electron-ipc.md`                | チャネルホワイトリストと契約ドリフト防止観点（P44/P45）        |
| 必須 | IPC契約チェック           | `ipc-contract-checklist.md`               | 3層同時更新（ハンドラ・Preload・仕様書）のチェック基準         |
| 必須 | 実装パターン              | `architecture-implementation-patterns.md` | P44系不整合の再発防止パターン参照                              |
| 必須 | 落とし穴・教訓            | `lessons-learned.md`                      | 既存 `skill:import` 修正タスクの再発防止ポイント抽出           |
| 補助 | Skill IPCセキュリティ詳細 | `security-skill-ipc.md`                   | `skill:import` 系チャネルのバリデーション詳細確認              |
| 補助 | 型/チャネル調査手順       | `ipc-type-resolution-guide.md`            | チャネル名衝突時の横断grep手順と確認観点を明確化               |

### 非該当（今回の実装範囲）

| カテゴリ          | 判定   | 理由                                          |
| ----------------- | ------ | --------------------------------------------- |
| `database-*.md`   | 非該当 | DBスキーマ・永続化仕様の変更なし              |
| `ui-ux-*.md`      | 非該当 | UI実装ではなく仕様書上のIPCチャネル整合が対象 |
| `deployment-*.md` | 非該当 | 配布・CI構成への変更なし                      |
