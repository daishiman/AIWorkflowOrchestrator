# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| Phase名    | 設計レビューゲート              |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 2: 設計                   |
| 次Phase    | Phase 4: テスト作成             |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

IPC 契約チェックリスト準拠の確認、セキュリティ要件の均一性検証、統合方針の妥当性を gate 判定する。

## 実行タスク

### Task 1: IPC 契約チェックリスト準拠確認

`ipc-contract-checklist.md` の必須項目に照らして設計を検証する:

- Main Process ハンドラー（creatorHandlers.ts）の変更が型定義と同期していること
- Preload API（skill-creator-api.ts）の変更が Main ハンドラーと整合していること
- 型定義（skillCreator.ts）の変更が Main/Preload 両方に反映されていること
- チャネルホワイトリスト（channels.ts）が全チャネルを網羅していること

### Task 2: セキュリティ要件均一性検証

`security-skill-ipc-core.md` に基づき、設計が以下を満たすことを確認する:

- パストラバーサル防止が両経路（Session/Runtime）で均一に適用される設計であること
- コマンドインジェクション防止が均一に適用される設計であること
- sender 検証（`event.senderFrame` / `webContents.id`）が全ハンドラーに適用される設計であること
- セキュリティチェックの共通化により、経路間のギャップが解消される設計であること

### Task 3: 統合方針の妥当性評価

Phase 2 で選択した統合方針について:

- 既存コードへの影響が許容範囲内であること
- 既存テストの修正範囲が合理的であること
- 段階的移行が可能であること（big bang 変更を避ける）
- TASK-UI-01（ルート昇格）完了後の実施が前提として整合していること

### Task 4: チャネル命名規則の一貫性確認

- 提案された命名規則が `api-ipc-agent-core.md` の既存チャネル命名と矛盾しないこと
- namespace prefix の粒度が適切であること
- 既存チャネルからの移行パスが定義されていること

### Task 5: gate 判定

| 判定     | 条件                                           | 対応                             |
| -------- | ---------------------------------------------- | -------------------------------- |
| PASS     | 設計が IPC 契約/セキュリティ要件を満たしている | Phase 4 へ                       |
| MINOR    | 軽微な命名修正が必要だが実装可能               | 修正内容を記録し Phase 4 へ      |
| MAJOR    | セキュリティ要件に不備があり設計修正が必要     | Phase 2 へ差し戻し               |
| CRITICAL | 統合方針の根本見直しが必要                     | Phase 1 へ差し戻しユーザーに確認 |

## 参照資料

| 資料名            | パス                                            | 説明               |
| ----------------- | ----------------------------------------------- | ------------------ |
| 設計書            | `outputs/phase-2/design-document.md`            | レビュー対象       |
| 統合戦略書        | `outputs/phase-2/ipc-unification-strategy.md`   | 方針選択の根拠     |
| 要件定義成果物    | `outputs/phase-1/spec-extraction-map.md`        | AC-1〜AC-7         |
| IPCチャネル棚卸し | `outputs/phase-1/ipc-channel-inventory.md`      | チャネル完全一覧   |
| skill-creator-api | `apps/desktop/src/preload/skill-creator-api.ts` | 現行 preload       |
| channels.ts       | `apps/desktop/src/preload/channels.ts`          | 現行ホワイトリスト |
| creatorHandlers   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | 現行ハンドラー     |

### システム仕様（aiworkflow-requirements）

> 設計レビューで必ず以下の仕様との整合性を確認してください。

| 参照資料                  | パス                                                                           | 内容                             |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| Agent IPC チャネル仕様    | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`      | IPC チャネル定義の正本との整合性 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC変更の整合性検証              |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティパターン準拠確認     |

## 統合テスト連携

- Phase 4 のテスト観点が AC-1〜AC-7 を 1:1 に覆うことを確認する
- セキュリティテストケースが均一性の検証を含むことを確認する

## 成果物

| 成果物           | パス                                    | 説明                                               |
| ---------------- | --------------------------------------- | -------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-gate.md` | gate 判定、IPC契約準拠、セキュリティ均一性検証結果 |

## 完了条件

- [ ] IPC 契約チェックリスト準拠が確認されている
- [ ] セキュリティ要件の均一性が検証されている
- [ ] 統合方針の妥当性が評価されている
- [ ] チャネル命名規則の一貫性が確認されている
- [ ] gate 判定（PASS/MINOR/MAJOR/CRITICAL）が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
