# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 3                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 2                          |
| 後続Phase  | Phase 4                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

Phase 2 の設計内容を検査し、IPC 4層整合性・型安全性・ホワイトリスト登録の漏れがないことを確認する。

## レビューチェックリスト

### AC 検証

- [ ] AC-1: `cancelGeneration: () => Promise<IpcResult<void>>` のインターフェース定義が設計されているか
- [ ] AC-2: `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` の実装が設計されているか
- [ ] AC-3: `ALLOWED_INVOKE_CHANNELS` への `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 登録が設計されているか
- [ ] AC-4: `pnpm typecheck` PASS が期待できるか

### IPC 4層整合性チェック

- [ ] 層1（CANCEL-001）の定数が本タスクの実装で正しく参照されているか
- [ ] 層3（CANCEL-003）に向けて `ipcMain.handle` が登録されることを前提とした設計になっているか
- [ ] `ALLOWED_INVOKE_CHANNELS` 未登録時に `safeInvoke` が失敗することへの対処が設計に含まれているか

### 型安全性チェック

- [ ] `IpcResult<void>` の `void` 型が Main ハンドラーの戻り値型と整合しているか
- [ ] `SkillCreatorAPI` への追加が `types.ts` へ自動伝播することが確認されているか

### 判定基準

| 判定  | 条件                     | 対応           |
| ----- | ------------------------ | -------------- |
| PASS  | 全チェック項目が問題なし | Phase 4 へ     |
| MINOR | 軽微な修正が必要         | 修正後 PASS    |
| MAJOR | 設計の根本的な問題あり   | Phase 2 へ戻る |

## 統合テスト連携【必須】

| 判定項目              | 基準     | 結果    |
| --------------------- | -------- | ------- |
| IPC 4層整合性確認完了 | 完了     | pending |
| 型安全性確認完了      | 完了     | pending |
| PASS / MAJOR 判定完了 | 判定済み | pending |

## 多角的チェック観点（AIが判断）

- [ ] `ALLOWED_INVOKE_CHANNELS` 未登録によるデッドチャンネル化リスクが設計で対処されているか
- [ ] Phase 4 のテスト作成に必要な情報が設計書に揃っているか

## サブタスク管理

1. AC-1〜AC-4 の設計検証
2. IPC 4層整合性チェック
3. 型安全性チェック
4. PASS / MINOR / MAJOR 判定
5. 設計レビュー結果の成果物作成

## 成果物

| 成果物           | パス                               | 説明               |
| ---------------- | ---------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | 判定結果・指摘事項 |

## 完了条件

- [ ] 全チェック項目が確認されている
- [ ] PASS / MINOR / MAJOR が判定されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 4: テスト作成
