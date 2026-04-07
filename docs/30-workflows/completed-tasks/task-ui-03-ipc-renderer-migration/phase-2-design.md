# Phase 2: 設計

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 機能名     | task-ui-03-ipc-renderer-migration      |
| 対象機能   | TASK-UI-03-REMAINING IPC renderer 移行 |
| 前提Phase  | Phase 1: 要件定義                      |
| 次Phase    | Phase 3: 設計レビュー                  |
| ステータス | pending                                |
| 作成日     | 2026-04-07                             |

## 目的

2コンポーネントの IPC 経路移行方針を設計し、IPC分離契約設計ドキュメントとチャネル命名規則ガイドラインを策定する。

## 実行タスク

### Task 1: コンポーネント移行設計

各コンポーネントの変更内容を設計する:

**ImprovementProposalPanel.tsx (line 73)**:

- 変更前: `await window.electronAPI.skillCreator.applyRuntimeImprovement(...)`
- 変更後: `await window.skillCreatorAPI.applyRuntimeImprovement(...)`
- 型定義の変更有無を確認する

**GovernanceSummaryPanel.tsx (line 93)**:

- 変更前: `window.electronAPI.skillCreator.getGovernanceState`（参照）
- 変更後: `window.skillCreatorAPI.getGovernanceState`（参照）
- 型定義の変更有無を確認する

### Task 2: IPC分離契約設計ドキュメント作成（TASK-UI-03 本来の主要成果物）

TASK-UI-02で実施された方針Bに基づき、以下を文書化する:

- **Session系チャネル**（会話フロー）の責務定義
  - 廃止済み（`skillCreatorSessionAPI` は全メソッドno-op）
  - 旧担当: `window.skillCreatorSessionAPI`
- **Runtime系チャネル**（ワークフロー状態管理）の責務定義
  - 現担当: `window.skillCreatorAPI`（`apps/desktop/src/preload/skill-creator-api.ts`）
  - ハンドラー: `apps/desktop/src/main/ipc/creatorHandlers.ts`
- **新機能開発者向けガイドライン**:
  - 会話フロー → `window.skillCreatorAPI` の session 系メソッド
  - ワークフロー状態管理 → `window.skillCreatorAPI` の runtime 系メソッド
  - `window.electronAPI.skillCreator` は新規 renderer から使用禁止（preload の互換シムとしてのみ残存）

### Task 3: チャネル命名規則ガイドライン策定

`apps/desktop/src/preload/channels.ts` の命名パターンを分析し:

- 現状の `skill-creator:*` プレフィックスの一貫性確認
- 新規チャネル追加時の命名方針の文書化

### Task 4: electronAPI.skillCreator の扱いを決定

現在 `preload/index.ts` の `electronAPI` に `skillCreator: skillCreatorAPI` が含まれている。
この互換シムについては、次の方針を Phase 2 で明文化する:

- canonical API は `window.skillCreatorAPI` に固定する
- `window.electronAPI.skillCreator` は preload 内の互換シムとして残す
- renderer の新規実装では `window.electronAPI.skillCreator` を参照しない
- シム削除は、repo-wide grep が 0 件になった後の follow-up task に回す

設計判断としては、API の owner と canonical surface、互換ポリシー、削除トリガーまでを書けば十分であり、個別ファイルの機械的置換手順までは Phase 5 以降に委ねる。

## 参照資料

| 資料名                | パス                                                                          | 説明                    |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------- |
| 要件定義成果物        | `outputs/phase-1/requirements-definition.md`                                  | 移行箇所と受入条件      |
| skill-creator-api.ts  | `apps/desktop/src/preload/skill-creator-api.ts`                               | 移行先APIの定義         |
| preload/index.ts      | `apps/desktop/src/preload/index.ts`                                           | API公開エントリポイント |
| channels.ts           | `apps/desktop/src/preload/channels.ts`                                        | チャネルホワイトリスト  |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 同時更新チェック        |

## 多角的チェック観点

| 観点           | 適用判断                             | 確認内容                                    |
| -------------- | ------------------------------------ | ------------------------------------------- |
| アーキテクチャ | IPC統合設計のため適用                | 分離契約が既存パターンと一貫すること        |
| IPC通信        | チャネル命名規則策定のため適用       | 正本仕様との一貫性                          |
| セキュリティ   | contextBridge経由のAPI公開設計のため | 公開API変更がセキュリティ要件を維持すること |

## 統合テスト連携

- Phase 3 のレビュー結果を引き継ぐ
- Phase 4 のテストケース設計へ反映する

## 成果物

| 成果物        | パス                                          | 説明                                |
| ------------- | --------------------------------------------- | ----------------------------------- |
| 設計書        | `outputs/phase-2/design-document.md`          | 移行方針・IPC分離契約・命名規則     |
| IPC統合戦略書 | `outputs/phase-2/ipc-unification-strategy.md` | 方針Bの根拠・新機能開発ガイドライン |

## 完了条件

- [ ] 2コンポーネントの変更内容が明確に設計されている
- [ ] IPC分離契約設計ドキュメントの内容が確定している
- [ ] チャネル命名規則ガイドラインの方針が決定している
- [ ] `electronAPI.skillCreator` の扱い（preload 互換シムとして残存）が決定している
- [ ] 既存テストへの影響範囲が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
