# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 1                                                     |
| 作成日   | 2026-03-23                                            |

## 1. 対象スコープ

### 設計対象（本タスクで確定する）

| ID   | 対象                                    | 成果物の種類   |
| ---- | --------------------------------------- | -------------- |
| S-01 | lane 分離設計（integrated / manual）    | 契約定義       |
| S-02 | direct SDK path 整理順と ownership 定義 | タイムライン表 |
| S-03 | silent fallback の明示化設計            | 契約定義       |
| S-04 | UI 4領域の契約定義                      | UI 仕様        |
| S-05 | ModifierResponse 拡張設計               | DTO 仕様       |
| S-06 | screenshot / walkthrough contract 定義  | TC-ID 表       |
| S-07 | Task09 governance follow-up ルール定義  | follow-up 表   |

### 実装は行わない（設計タスクのため）

本タスクは「設計」分類であり、プロダクションコードの変更は行わない。Phase 4-5 で future implementation の execution plan を組み立てるが、コード変更自体は後続の実装タスクで行う。

## 2. 除外スコープ

| ID   | 除外対象                                     | 理由                         | 担当タスク               |
| ---- | -------------------------------------------- | ---------------------------- | ------------------------ |
| E-01 | Agent SDK 統合実装                           | Task09 governance の責務     | UT-SLIDE-IMPL-001        |
| E-02 | SlideWorkspace UI 4領域のコード実装          | 実装タスクで対応             | UT-SLIDE-UI-001          |
| E-03 | P31 無限ループ対策の実装                     | 個別実装タスクで対応         | UT-SLIDE-P31-001         |
| E-04 | terminal handoff 重複解消の実装              | 個別実装タスクで対応         | UT-SLIDE-HANDOFF-DUP-001 |
| E-05 | IPC channel の実際のリネーム/統一            | Task09 governance + 後続実装 | Task09 follow-up         |
| E-06 | mainline 契約（Chat / Agent / Skill Center） | 別タスクの責務               | Task01-07                |

## 3. 依存タスク

### 上流依存（本タスク開始の前提条件）

| タスクID                                          | 内容                      | 共有する契約                        |
| ------------------------------------------------- | ------------------------- | ----------------------------------- |
| TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 | terminal handoff 共通設計 | TerminalHandoffCard, ManualBoundary |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001        | runtime policy 一元化     | capability DTO, policy gate         |

### 下流依存（本タスク成果物を利用するタスク）

| タスクID                 | 内容                          | 利用する成果物        |
| ------------------------ | ----------------------------- | --------------------- |
| UT-SLIDE-IMPL-001        | Slide integrated runtime 実装 | lane 分離設計         |
| UT-SLIDE-UI-001          | SlideWorkspace UI 反映        | UI 4領域契約          |
| UT-SLIDE-P31-001         | P31 対策                      | state 契約            |
| UT-SLIDE-HANDOFF-DUP-001 | handoff 重複解消              | terminal handoff 契約 |
| Task09 governance        | legacy cleanup governance     | follow-up ルール      |

## 4. 状態語彙の境界（ui-ux-realization.md 準拠）

本タスクで使用する状態語彙を以下に固定する。

| 状態     | 定義                                   | 含めない意味                 |
| -------- | -------------------------------------- | ---------------------------- |
| synced   | 正常同期完了                           | -                            |
| running  | 実行中                                 | -                            |
| degraded | legacy lane で品質低下を明示           | silent failure、自動復旧     |
| guidance | ユーザーへの操作ガイダンスが必要       | 自動実行、hidden automation  |
| fallback | 自動復旧不能、manual intervention 必須 | silent retry、自動成功の外観 |

## 5. Phase 制約

| 制約                                       | 内容                                               |
| ------------------------------------------ | -------------------------------------------------- |
| Phase 4 は Phase 1-3 完了まで開始しない    | 設計ゲートを通過していない状態でのテスト設計を禁止 |
| Phase 13 はユーザー指示なしに実行しない    | commit / PR はユーザー明示指示のみ                 |
| 本タスクでプロダクションコードは変更しない | 設計タスクのため、outputs/ 以下の成果物のみ作成    |
