# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | カバレッジ確認                  |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 6: テスト拡充             |
| 次Phase    | Phase 8: リファクタリング       |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

AC-1〜AC-7 と全 IPC チャネルのカバレッジを照合し、統合の抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ

AC ごとのテスト対応表を作成する:

| AC   | 条件                          | テスト種別     | テスト対象                | 判定 |
| ---- | ----------------------------- | -------------- | ------------------------- | ---- |
| AC-1 | IPC 経路の統一設計方針        | 設計レビュー   | Phase 3 gate 結果         | TBD  |
| AC-2 | 開発者が IPC 経路を判断できる | ドキュメント   | Phase 12 ガイド           | TBD  |
| AC-3 | preload 層の API surface 整理 | ユニットテスト | skill-creator-api.test.ts | TBD  |
| AC-4 | creatorHandlers 整合的構成    | ユニットテスト | creatorHandlers.test.ts   | TBD  |
| AC-5 | IPC 契約チェックリスト準拠    | チェックリスト | 契約ドリフト検証          | TBD  |
| AC-6 | セキュリティ要件均一適用      | セキュリティ   | 均一性テスト              | TBD  |
| AC-7 | 既存テスト pass               | CI             | 全テスト実行              | TBD  |

### Task 2: IPC チャネルカバレッジ

- 全 Session IPC チャネルがテストで覆われていることを確認する
- 全 Runtime IPC チャネルがテストで覆われていることを確認する
- チャネルホワイトリストの全エントリがテストされていることを確認する
- 不正チャネルの拒否テストが存在することを確認する

### Task 3: セキュリティカバレッジ

- パストラバーサル防止が両経路の全チャネルでテストされていることを確認する
- sender 検証が全ハンドラーでテストされていることを確認する
- コマンドインジェクション防止がテストされていることを確認する

### Task 4: 依存関係カバレッジ

- preload（skill-creator-api.ts）、Main（creatorHandlers.ts）、型定義（skillCreator.ts）の 3 層が各層でテストされていることを確認する
- channels.ts のホワイトリストとハンドラーの整合性がテストされていることを確認する

### カバレッジ測定対象ファイル

| ファイル             | パス                                            | 測定対象                                 |
| -------------------- | ----------------------------------------------- | ---------------------------------------- |
| skill-creator-api.ts | `apps/desktop/src/preload/skill-creator-api.ts` | API surface の公開メソッド               |
| channels.ts          | `apps/desktop/src/preload/channels.ts`          | チャネルホワイトリスト                   |
| creatorHandlers.ts   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | 全ハンドラーのルーティングとセキュリティ |
| skillCreator.ts      | `packages/shared/src/types/skillCreator.ts`     | 型定義の整合性                           |

## 参照資料

| 資料名           | パス                                       | 説明            |
| ---------------- | ------------------------------------------ | --------------- |
| テスト拡充記録   | `outputs/phase-6/test-expansion.md`        | coverage 対象   |
| 実装記録         | `outputs/phase-5/implementation-record.md` | coverage の根拠 |
| テストマトリクス | `outputs/phase-4/test-matrix.md`           | AC 対応の元     |

### システム仕様（aiworkflow-requirements）

> カバレッジ確認時に以下のシステム仕様を参照してください。

| 参照資料                  | パス                                                                           | 内容                       |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC整合性のカバレッジ基準  |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティカバレッジ基準 |

## 統合テスト連携

- IPC チャネルカバレッジを coverage の中核ケースに置く
- concern coverage を行数より優先して判定する

## 成果物

| 成果物             | パス                                 | 説明                                                  |
| ------------------ | ------------------------------------ | ----------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC 対応表、チャネルカバレッジ、セキュリティカバレッジ |

## 完了条件

- [ ] AC-1〜AC-7 の対応表がある
- [ ] 全 IPC チャネルの coverage が確認されている
- [ ] セキュリティカバレッジが確認されている
- [ ] 3 層（preload/Main/型定義）の coverage が確認されている
- [ ] Phase 8 に渡す重複削減候補が整理されている
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
