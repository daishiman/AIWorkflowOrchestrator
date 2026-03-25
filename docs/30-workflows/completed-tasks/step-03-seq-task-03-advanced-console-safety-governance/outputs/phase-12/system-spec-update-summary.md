# Phase 12 System Spec Update Summary

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001      |
| Phase      | 12 (Task 12-2)                                       |
| 作成日     | 2026-03-24                                           |
| タスク種別 | 設計・実装タスク（IPC handler・Service・UI実装含む） |

## 方針

設計検証用のコードを含むが、production統合（handler登録、Preload API公開）は後続の実装タスクで実施する。P57 準拠で、`.claude/skills/` 配下のシステム仕様書の実更新は後続の実装タスクの PR 作成時に実施する。

本ドキュメントでは、実装タスク完了時に同期が必要なシステム仕様書の一覧と更新内容を計画として記録する。

## 同期対象一覧

### Step 1-A: タスク完了記録

| 対象ファイル                          | 更新内容                                                 | 優先度 |
| ------------------------------------- | -------------------------------------------------------- | ------ |
| `aiworkflow-requirements/LOGS.md`     | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 完了記録 | 必須   |
| `task-specification-creator/LOGS.md`  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 完了記録 | 必須   |
| `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに本タスクの設計完了を記録               | 必須   |
| `task-specification-creator/SKILL.md` | 変更履歴テーブルに本タスクの設計完了を記録               | 必須   |

**P1/P25 対策**: LOGS.md は2箇所あり、片方の更新忘れが起きやすい。両方を同時に更新すること。

### Step 1-B: 実装状況テーブル

| 対象ファイル                                              | 更新内容                          | 条件     |
| --------------------------------------------------------- | --------------------------------- | -------- |
| `aiworkflow-requirements/references/ui-ux-realization.md` | Task03 safety governance 設計完了 | 該当する |

### Step 1-C: 関連タスクテーブル

実装タスク完了時に以下のコマンドで関連仕様書を検索する:

```bash
grep -rn "TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001" .claude/skills/aiworkflow-requirements/references/
```

更新候補:

| 対象ファイル（候補）                                 | 更新内容                                  |
| ---------------------------------------------------- | ----------------------------------------- |
| `references/ui-ux-realization.md`                    | Task03 完了状態の反映                     |
| `references/ui-ux-execution-console.md`              | approval/disclosure/advanced console 追加 |
| `references/security-api-electron.md`                | consumer auth guard / approval gate 追記  |
| `references/architecture-implementation-patterns.md` | approval enforcement パターン追加         |

### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/indexes/generate-index.js
```

**P2/P27 対策**: 仕様書に変更があれば必ず再生成を実行する。

### Step 2: システム仕様更新

本タスクで新規に定義されたアーキテクチャ要素:

| 新規要素                              | 追記先仕様書（候補）                                 | 更新内容                          |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| ApprovalGate interface                | `references/architecture-implementation-patterns.md` | Approval enforcement パターン     |
| SessionDisclosureBanner               | `references/ui-ux-execution-console.md`              | disclosure 表示規則               |
| AdvancedConsolePanel                  | `references/ui-ux-execution-console.md`              | opt-in detail layer 設計          |
| Layer Architecture                    | `references/architecture-overview.md`                | 3層構造（Primary/Safety/Detail）  |
| DENY-1〜DENY-10                       | `references/security-api-electron.md`                | compliance 禁止事項               |
| MUST-1〜MUST-10                       | `references/security-api-electron.md`                | compliance 遵守事項               |
| CAG-1〜CAG-3                          | `references/security-api-electron.md`                | consumer auth guard               |
| approvalHandlers.ts                   | `references/api-ipc-system-core.md`                  | approval IPC handler 契約         |
| disclosureHandlers.ts                 | `references/api-ipc-system-core.md`                  | disclosure IPC handler 契約       |
| advancedConsoleHandlers.ts            | `references/api-ipc-system-core.md`                  | advanced console IPC handler 契約 |
| Consumer Auth Guard (isConsumerToken) | `references/security-electron-ipc-core.md`           | DENY-1/CAG-1 実装パターン         |
| sanitizeForApiKeys                    | `references/security-electron-ipc-core.md`           | DENY-6 実装パターン               |

### Step 3: IPC 契約検証

新規 IPC channel が5つ追加される予定:

| Channel                         | 方向                    | 検証項目                                                                          |
| ------------------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `execution:get-terminal-log`    | Renderer→Main (invoke)  | ALLOWED_INVOKE_CHANNELS 追加、P42 3段バリデーション、応答型定義                   |
| `execution:get-copy-command`    | Renderer→Main (invoke)  | ALLOWED_INVOKE_CHANNELS 追加、P42 3段バリデーション、応答型定義                   |
| `execution:get-disclosure-info` | Renderer→Main (invoke)  | ALLOWED_INVOKE_CHANNELS 追加、DENY-5（API key非送信）、応答型定義                 |
| `approval:respond`              | Renderer→Main (invoke)  | ALLOWED_INVOKE_CHANNELS 追加、P42 3段バリデーション、sender検証、ApprovalGate連携 |
| `approval:request`              | Main→Renderer (push/on) | ALLOWED_ON_CHANNELS 追加、ApprovalGate連携、push通知送信実装                      |

実装タスク完了時に `ipc-contract-checklist.md` Phase 1-6 を実施する。

## 実行タイミング

| ステップ | 実行タイミング             | 備考                                   |
| -------- | -------------------------- | -------------------------------------- |
| Step 1-A | 実装タスク Phase 12 完了時 | LOGS.md 2ファイル + SKILL.md 2ファイル |
| Step 1-B | 実装タスク Phase 12 完了時 | 実装ステータス更新                     |
| Step 1-C | 実装タスク Phase 12 完了時 | grep で関連仕様書を検索して更新        |
| Step 1-D | 実装タスク Phase 12 完了時 | generate-index.js を実行               |
| Step 2   | 実装タスク Phase 12 完了時 | 新規アーキテクチャ要素の仕様書追記     |
| Step 3   | 実装タスク Phase 12 完了時 | IPC 契約チェックリスト Phase 1-6       |
