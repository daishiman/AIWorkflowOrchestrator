# Phase 5: 実装

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 5                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

policy module、hooks factory、audit sink、UI payload を実装する。

## 実行タスク

- phase 別 policy module 実装
- `canUseTool` 実装
- hooks factory / audit sink 実装
- UI payload / IPC 公開

## 参照資料

| 資料名  | パス                | 説明 |
| ------- | ------------------- | ---- |
| Phase 2 | `phase-2-design.md` | 設計 |

## 実行手順

### ステップ1: 変更対象を確定する

- `RuntimeSkillCreatorFacade.ts`
- `creatorHandlers.ts`
- `skill-creator-api.ts`
- `packages/shared/src/types/skillCreator.ts`

### ステップ2: policy / hooks / audit を実装する

- phase 別 policy module
- `canUseTool`
- hooks factory / audit sink

### ステップ3: UI / IPC を接続する

- governance 表示
- permission denial 表示
- audit event の公開

### ステップ4: baseline を確認する

- 既存テストの回帰がないかを確認する
- 新規ファイルと修正ファイルの一覧を残す

## 成果物

| 成果物                | パス                                       | 説明     |
| --------------------- | ------------------------------------------ | -------- |
| implementation record | `outputs/phase-5/implementation-record.md` | 実装記録 |

## 完了条件

- [x] policy module が実装されている
- [x] hooks / audit が実装されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 4 の test matrix に対して実装を接続する
- permission denial / hook sequence / UI payload が期待値と一致するか確認する

## 多角的チェック観点（AIが判断）

- `.claude` 正本を壊していないか
- mirror sync 前提が満たされているか
- 変更対象が漏れなく列挙されているか

## サブタスク管理

| SubAgent   | 責務               |
| ---------- | ------------------ |
| SubAgent-A | policy module 実装 |
| SubAgent-B | hooks / audit 実装 |
| SubAgent-C | UI / IPC 接続      |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 6: テスト拡充
