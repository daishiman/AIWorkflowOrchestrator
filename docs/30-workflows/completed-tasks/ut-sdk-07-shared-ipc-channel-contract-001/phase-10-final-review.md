# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 10                                          |
| Phase名    | 最終レビューゲート                          |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001   |
| タスク名   | Skill Creator runtime channel shared 正本化 |
| 前提Phase  | Phase 9: 品質保証                           |
| 後続Phase  | Phase 11: 手動テスト                        |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-06                                  |

## 目的

acceptance criteria（AC-1〜AC-7）と blocker を判定し、本タスクの完了可否を最終決定する。Phase 3 と同様のレビューゲートを実施する。

## 背景

Phase 9（品質保証）を通過した実装に対して、Phase 1 で定義した受入基準（AC-1〜AC-7）を 1 件ずつ照合し、全基準を満たしていることを確認する。問題がある場合は影響範囲に応じた Phase へ差し戻す。Phase 10 の MINOR 指摘は必ず未タスク化すること。

## 実行タスク

### タスク1: AC-1〜AC-7 の充足確認

**目的**: Phase 1 で定義した受入基準を 1 件ずつ検証する

**AC 充足確認テーブル**:

| AC   | 受入基準                                                                                                      | 検証方法                                                                                | 判定 |
| ---- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---- |
| AC-1 | `SKILL_CREATOR_PROGRESS` が `packages/shared/src/ipc/channels.ts` に定義されている                            | `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` を目視確認    | [ ]  |
| AC-2 | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が `packages/shared/src/ipc/channels.ts` に定義されている              | 同上                                                                                    | [ ]  |
| AC-3 | `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` が `packages/shared/src/ipc/channels.ts` に定義されている              | 同上                                                                                    | [ ]  |
| AC-4 | `apps/desktop/src/preload/channels.ts` が 3 チャンネルを `@repo/shared/src/ipc/channels` から import している | `apps/desktop/src/preload/channels.ts` の import 文を確認・直書き除去を確認             | [ ]  |
| AC-5 | cross-layer parity テストが全 3 チャンネルで PASS する                                                        | parity テスト実行結果を確認（Phase 9 で確認済みの結果を参照）                           | [ ]  |
| AC-6 | 既存の IPC handler / preload API / ALLOWED_ON_CHANNELS に破壊的変更がない                                     | `approvalHandlers`、`executionHandlers` のテスト結果、Phase 9 後方互換性確認結果を参照  | [ ]  |
| AC-7 | `packages/shared/src/ipc/channels.ts` の `IPC_CHANNELS` に 3 チャンネルが含まれている                         | `IPC_CHANNELS` のスプレッドに `SKILL_CREATOR_RUNTIME_CHANNELS` が含まれていることを確認 | [ ]  |

---

### タスク2: レビュー観点の確認

**目的**: 受入基準以外の品質面を最終確認する

**実行手順**:

1. **shared 定義の完全性**: `SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクトの 3 チャンネルが全て定義されているか確認する
2. **preload import の切り替え完了**: `apps/desktop/src/preload/channels.ts` に direct 文字列定義が残っていないか確認する
3. **parity テスト PASS**: cross-layer parity テストが全 3 チャンネルで通過しているか確認する
4. **後方互換性**: 既存の import パスや IPC handler が破壊されていないか確認する
5. **Phase 9 品質保証結果**: 品質ゲート通過状態を再確認する

---

### タスク3: ゲート判定

**目的**: 最終レビュー結果を判定する

**判定基準テーブル**:

| 判定     | 条件                                     | 次のアクション                                                     |
| -------- | ---------------------------------------- | ------------------------------------------------------------------ |
| PASS     | AC-1〜AC-7 が全て充足されている          | Phase 11 へ進行                                                    |
| MINOR    | 軽微な指摘あり（ドキュメント・コメント） | 指摘を未タスク化した上で Phase 11 へ進行（MINOR は未タスク化必須） |
| MAJOR    | AC の一部が未達・後方互換性に問題あり    | 影響範囲に応じた Phase へ差し戻す                                  |
| CRITICAL | AC の大部分が未達・設計方針の問題        | Phase 1 へ戻りユーザー確認                                         |

**戻り先決定基準テーブル**:

| 問題の種類                        | 戻り先                      |
| --------------------------------- | --------------------------- |
| 要件の認識齟齬                    | Phase 1（要件定義）         |
| 設計方針の問題                    | Phase 2（設計）             |
| テスト設計の問題                  | Phase 4（テスト作成）       |
| 実装の不具合                      | Phase 5（実装）             |
| テスト検証の漏れ                  | Phase 6（テスト拡充）       |
| カバレッジ未達                    | Phase 7（カバレッジ確認）   |
| リファクタリングによる regression | Phase 8（リファクタリング） |
| 品質基準未達                      | Phase 9（品質保証）         |

> **注記**: Phase 10 MINOR 指摘は必ず未タスク化し、`outputs/phase-10/final-review-result.md` に記録すること。

---

## 参照資料

| 参照資料                 | パス                                                                         | 用途                    |
| ------------------------ | ---------------------------------------------------------------------------- | ----------------------- |
| Phase 1 受入基準         | `phase-1-requirements.md`                                                    | 受入基準の原本          |
| Phase 9 品質保証結果     | `outputs/phase-9/quality-assurance-result.md`                                | 品質ゲート判定結果      |
| Phase 9 セキュリティ確認 | `outputs/phase-9/security-check-result.md`                                   | preload allowlist 確認  |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャンネル定義 |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                       | preload 側チャンネル    |
| governance bundle test   | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | parity テスト           |
| shared channels test     | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | shared チャンネルテスト |

## 統合テスト連携

- 最終レビューの一環として統合テスト（cross-layer parity）結果を確認する
- cross-layer parity テストの成功が AC-5 の根拠となる
- 既存テスト全 green が AC-6 の根拠となる
- `IPC_CHANNELS` スプレッド確認が AC-7 の根拠となる

## 成果物

| 成果物           | パス                                            | 内容                               |
| ---------------- | ----------------------------------------------- | ---------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`       | ゲート判定結果・MINOR 未タスク一覧 |
| 受入基準照合表   | `outputs/phase-10/acceptance-criteria-check.md` | AC-1〜AC-7 の検証結果一覧          |

## 完了条件

- [ ] AC-1〜AC-7 全て充足（BLOCKER/MAJOR なし）
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が決定されている
- [ ] MINOR 以下であれば Phase 11 への進行が承認されている
- [ ] MINOR 指摘が未タスク化されている（指摘がある場合）
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] `outputs/phase-10/acceptance-criteria-check.md` が生成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 依存関係

| 依存 Phase | 依存成果物                                    |
| ---------- | --------------------------------------------- |
| Phase 9    | `outputs/phase-9/quality-assurance-result.md` |
| Phase 9    | `outputs/phase-9/security-check-result.md`    |

## 次のPhase

Phase 11: 手動テスト → `phase-11-manual-test.md`
