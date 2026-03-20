# Phase 7: カバレッジ目標

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 7                                                         |
| 作成日   | 2026-03-20                                                |

## Concern 別 Coverage Gate

### Concern A: capability 契約（RuntimePolicyResolver）

| 指標              | 最低基準 | 推奨基準 | 測定対象                    | 達成に必要なテストケース |
| ----------------- | -------- | -------- | --------------------------- | ------------------------ |
| Line Coverage     | 90%      | 95%      | `RuntimePolicyResolver.ts`  | CA-1-CA-5 + E-1, E-2     |
| Branch Coverage   | 80%      | 90%      | `resolve()` の全分岐        | 4 状態 x 各補助条件      |
| Function Coverage | 100%     | 100%     | `resolve()` + `constructor` | CA-1-CA-5                |

### Concern B: state 語彙（AuthModeStatus DTO + capability slice）

| 指標              | 最低基準 | 推奨基準 | 測定対象                         | 達成に必要なテストケース |
| ----------------- | -------- | -------- | -------------------------------- | ------------------------ |
| Line Coverage     | 90%      | 95%      | `auth-mode.ts`, capability slice | CB-1-CB-5 + E-4-E-6      |
| Branch Coverage   | 80%      | 85%      | DTO 生成パスの全分岐             | state 変換の全組み合わせ |
| Function Coverage | 90%      | 95%      | DTO 生成関数 + slice selector    | CB-1-CB-5                |

### Concern C: CTA 契約（CTA コンポーネント）

| 指標              | 最低基準 | 推奨基準 | 測定対象              | 達成に必要なテストケース |
| ----------------- | -------- | -------- | --------------------- | ------------------------ |
| Line Coverage     | 80%      | 90%      | CTA コンポーネント    | CC-1-CC-5 + E-7, E-8     |
| Branch Coverage   | 70%      | 80%      | 全 capability x state | contract-matrix 全セル   |
| Function Coverage | 80%      | 90%      | 表示条件判定関数      | CC-1-CC-5                |

### 基準未達時の対応

coverage gate が最低基準を下回る場合は Phase 6 に戻り、不足テストケースを追加する。

## 実際のテスト結果（Phase 4-6 完了後）

| ファイル                              | テスト数 | 結果 | 備考                    |
| ------------------------------------- | -------- | ---- | ----------------------- |
| execution-capability-contract.test.ts | 13       | PASS | Concern A（CA-1〜CA-5） |
| ui-state-vocabulary-contract.test.ts  | 22       | PASS | Concern B（CB-1〜CB-5） |
| cta-contract.test.ts                  | 24       | PASS | Concern C（CC-1〜CC-5） |
| **合計**                              | **59**   | PASS | 全テスト PASS 確認済み  |

実行コマンド: `pnpm --filter @repo/shared exec vitest run src/types/__tests__/execution-capability-contract.test.ts src/types/__tests__/ui-state-vocabulary-contract.test.ts src/types/__tests__/cta-contract.test.ts`

---

## Residual Risk（Phase 9 への handoff）

| ID   | 内容                                         | Phase 9 での対応                                                       | 実装後ステータス                                                                                                                                                                     |
| ---- | -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RR-1 | E-3（API Key 不正形式）の期待動作が未確定    | Phase 2 設計書を参照して確定し、テストを追加する                       | 後続タスク持ち越し（本 Task01 スコープ外）                                                                                                                                           |
| RR-2 | E-5-E-6（IPC timeout）の mock 実装が未作成   | `vi.useFakeTimers` を使って timeout mock を実装する                    | 後続タスク持ち越し（IPC 実装は Task02〜 で対応）                                                                                                                                     |
| RR-3 | R-2（auto-send）の検証方法が UI イベント依存 | Playwright E2E テストで補完する                                        | 後続タスク持ち越し（E2E は Task11 相当で対応）                                                                                                                                       |
| RR-4 | P41（v8 インライン関数カバレッジ）未確認     | `getAllowedWindows` 相当のコールバックが呼ばれることを明示的に検証する | 本 Task01 の対象関数は pure function のみ。インライン arrow function は CAPABILITY_VALUES / UI_STATE_VALUES の定義のみ。Concern A/B/C テスト（59件）で全関数を明示的に呼び出し済み。 |

**RR-1〜RR-3** は Task01 の Contract 定義フェーズの対象外。後続 Task02〜 の IPC 実装・E2E テストフェーズで対応する。
**RR-4** は pure function 主体の本実装においては実質的に解消済み。
