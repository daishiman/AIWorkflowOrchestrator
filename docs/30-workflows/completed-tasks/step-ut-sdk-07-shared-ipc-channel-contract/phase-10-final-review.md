# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 10                                         |
| Phase名    | 最終レビューゲート                         |
| 前提Phase  | Phase 9                                    |
| 後続Phase  | Phase 11                                   |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

Phase 1 で定義した受入基準の達成を判定し、本タスクの完了可否を最終決定する。

## 背景

Phase 9（品質保証）を通過した実装に対して、Phase 1 の受入基準を1件ずつ照合し、全基準を満たしていることを確認する。問題がある場合は影響範囲に応じた Phase へ差し戻す。

---

## 実行タスク

### タスク1: 受入基準の照合

**目的**: Phase 1 で定義した受入基準を1件ずつ検証する

**実行手順**:

#### 受入基準チェックリスト

| #   | 受入基準                                                                                           | 検証方法                                                                                                                                                | 判定 |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | shared に `APPROVAL_RESPOND`, `APPROVAL_REQUEST`, `EXECUTION_GET_DISCLOSURE_INFO` が定義されている | `packages/shared/src/ipc/channels.ts` を目視確認                                                                                                        | [ ]  |
| 2   | desktop が shared から import している                                                             | `apps/desktop/src/preload/channels.ts` の import 文を確認                                                                                               | [ ]  |
| 3   | cross-layer parity テストが通る                                                                    | parity テスト実行結果を確認                                                                                                                             | [ ]  |
| 4   | `APPROVAL_RESPOND !== EXECUTION_GET_DISCLOSURE_INFO` separation assertion が通る                   | separation テスト実行結果を確認                                                                                                                         | [ ]  |
| 5   | 既存テスト全て green                                                                               | `apps/desktop/src/preload/channels.test.ts`, `governance-bundle.test.ts`, `approvalHandlers.test.ts`, `skill-creator-api.governance.test.ts` の結果確認 | [ ]  |

---

### タスク2: 追加レビュー観点

**目的**: 受入基準以外の品質面を最終確認する

**実行手順**:

1. **後方互換性**: 既存の import パスを使っている箇所が破壊されていないか確認する
2. **ドキュメント整合性**: チャネル定義のコメントが正確であるか確認する
3. **Phase 9 品質保証結果**: 品質ゲート通過状態を再確認する

---

### タスク3: ゲート判定

**目的**: 最終レビュー結果を判定する

#### レビュー結果判定基準

| 判定     | 条件                             | 次のアクション             |
| -------- | -------------------------------- | -------------------------- |
| PASS     | 全受入基準を満たしている         | Phase 11 へ進行            |
| MINOR    | 軽微な指摘あり（ドキュメント等） | 指摘対応後、Phase 11 へ    |
| MAJOR    | 受入基準の一部未達               | 影響範囲に応じて戻る       |
| CRITICAL | 受入基準の大部分が未達           | Phase 1 へ戻りユーザー確認 |

#### 戻り先決定基準

| 問題の種類                        | 戻り先                      |
| --------------------------------- | --------------------------- |
| 要件の認識齟齬                    | Phase 1（要件定義）         |
| 設計方針の問題                    | Phase 2（設計）             |
| 設計レビュー観点の漏れ            | Phase 3（設計レビュー）     |
| テスト設計の問題                  | Phase 4（テスト作成）       |
| 実装の不具合                      | Phase 5（実装）             |
| テスト検証の漏れ                  | Phase 6（テスト実行）       |
| 統合テストの失敗                  | Phase 7（統合テスト）       |
| リファクタリングによる regression | Phase 8（リファクタリング） |
| 品質基準未達                      | Phase 9（品質保証）         |

---

## 参照資料

| 参照資料                 | パス                                                                         | 内容                   |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------- |
| Phase 1 受入基準         | `phase-1-requirements.md`                                                    | 受入基準の原本         |
| Phase 9 品質保証結果     | `outputs/phase-9/quality-assurance-result.md`                                | 品質ゲート判定結果     |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャネル定義  |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                       | desktop 側チャネル定義 |
| preload channels test    | `apps/desktop/src/preload/channels.test.ts`                                  | allowlist / contract   |
| governance bundle test   | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 観点5 disclosure test  |
| approval handlers test   | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts`               | approval IPC test      |
| governance preload test  | `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts`    | allowlist governance   |

---

## 統合テスト連携（Phase 10）

- 最終レビューの一環として統合テスト結果を確認する
- cross-layer parity テストの成功が受入基準 #3 の根拠となる
- separation assertion の成功が受入基準 #4 の根拠となる
- 既存テスト全 green が受入基準 #5 の根拠となる

---

## 成果物

| 成果物           | パス                                            | 内容                     |
| ---------------- | ----------------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`       | ゲート判定結果と詳細     |
| 受入基準照合表   | `outputs/phase-10/acceptance-criteria-check.md` | 各受入基準の検証結果一覧 |

---

## 完了条件

- [ ] Phase 1 の受入基準5件が全て検証済み
- [ ] 追加レビュー観点（後方互換性・ドキュメント整合性）が確認済み
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が決定されている
- [ ] MINOR 以下であれば Phase 11 への進行が承認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 11: 手動テスト → `phase-11-manual-test.md`
