# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| Phase名    | 品質保証                                   |
| 前提Phase  | Phase 8                                    |
| 後続Phase  | Phase 10                                   |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

品質ゲートの通過判定を行い、コード品質・テスト網羅性・セキュリティの各基準を満たしていることを確認する。

## 背景

Phase 8 までのリファクタリングが完了した状態で、最終レビュー（Phase 10）に進む前に品質基準を客観的に検証する。本タスクは小規模（3チャネルの shared への移動）だが、preload allowlist のセキュリティ影響があるため品質保証を実施する。

---

## 実行タスク

### タスク1: 機能検証

**目的**: 全テストが成功していることを確認する

**実行手順**:

1. 全ユニットテストを実行する
   ```bash
   pnpm --filter @repo/shared test
   pnpm --filter @repo/desktop test
   ```
2. cross-layer parity テストが成功していることを確認する
3. `apps/desktop/src/preload/channels.test.ts` が green であることを確認する
4. `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` の観点5 が green であることを確認する
5. `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts` が green であることを確認する
6. `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts` が green であることを確認する

**完了基準**:

- 全ユニットテスト成功
- 全統合テスト成功

---

### タスク2: コード品質

**目的**: Lint・型チェック・フォーマットの品質基準を満たしていることを確認する

**実行手順**:

1. `pnpm lint` を実行し、ESLint エラーがないことを確認する
2. `pnpm typecheck` を実行し、TypeScript 型エラーがないことを確認する
3. コードフォーマット（Prettier）が適用済みであることを確認する

**完了基準**:

- `pnpm lint` エラー 0 件
- `pnpm typecheck` 型エラー 0 件
- フォーマット差分なし

---

### タスク3: テスト網羅性

**目的**: テストカバレッジが基準を達成していることを確認する

**実行手順**:

1. 変更対象ファイルのテストカバレッジを確認する
   - `packages/shared/src/ipc/channels.ts` の定義が parity テストでカバーされているか
   - 新規追加チャネル3件全てがテストで参照されているか
2. edge case（チャネル名の typo 検出、重複定義の防止）がテストされているか確認する

**完了基準**:

- 新規追加3チャネル全てがテストでカバーされている
- separation assertion（`APPROVAL_RESPOND !== EXECUTION_GET_DISCLOSURE_INFO`）が存在する

---

### タスク4: セキュリティ確認

**目的**: preload allowlist にセキュリティリスクのあるチャネルが追加されていないことを確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` の allowlist 変更差分を確認する
2. 追加されたチャネルが以下の基準を満たすか確認する：
   - ファイルシステムへの直接アクセスを許可するチャネルでないこと
   - シェルコマンド実行を許可するチャネルでないこと
   - 認証・認可バイパスにつながるチャネルでないこと
3. `APPROVAL_RESPOND` / `APPROVAL_REQUEST` / `EXECUTION_GET_DISCLOSURE_INFO` が適切なスコープで動作することを確認する

**完了基準**:

- セキュリティリスクのあるチャネルが allowlist に追加されていないこと
- 既存の allowlist ポリシーに違反していないこと

---

### タスク5: 変更行数の妥当性確認（Line Budget）

**目的**: 小規模タスクとして変更行数が妥当であることを確認する

**実行手順**:

1. `git diff --stat` で変更行数を確認する
2. 以下の目安と比較する：
   - shared channels.ts: 追加 10-20 行程度
   - desktop preload channels.ts: 変更 5-15 行程度（import 置換）
   - テストファイル: 追加 30-60 行程度
   - 合計: 100 行以内が妥当
3. 大幅に超過している場合はスコープクリープの有無を確認する

**完了基準**:

- 変更行数が小規模タスクとして妥当な範囲内であること（目安: 合計 100 行以内）

---

## 参照資料

| 参照資料                 | パス                                                                         | 内容                   |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------- |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャネル定義  |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                       | desktop 側チャネル定義 |
| governance bundle test   | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 観点5 disclosure test  |
| approval handlers test   | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts`               | approval IPC test      |
| governance preload test  | `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts`    | allowlist governance   |
| preload channels test    | `apps/desktop/src/preload/channels.test.ts`                                  | allowlist / contract   |
| Phase 8 リファクタ結果   | `phase-8-refactoring.md`                                                     | リファクタリング結果   |

---

## 統合テスト連携（Phase 9）

- 品質保証チェックの一環として統合テスト結果を確認する
- cross-layer parity テストが品質基準（全 Green）を満たしていることを検証する
- セキュリティ観点で preload 境界のテストが適切に実施されていることを確認する

---

## 成果物

| 成果物           | パス                                          | 内容                         |
| ---------------- | --------------------------------------------- | ---------------------------- |
| 品質保証結果     | `outputs/phase-9/quality-assurance-result.md` | 全品質ゲートの判定結果       |
| セキュリティ確認 | `outputs/phase-9/security-check-result.md`    | preload allowlist 安全性確認 |

---

## 完了条件

- [ ] 全ユニットテスト・統合テストが成功している
- [ ] `pnpm lint` エラーなし
- [ ] `pnpm typecheck` 型エラーなし
- [ ] コードフォーマットが適用済み
- [ ] テストカバレッジ基準を達成している
- [ ] preload allowlist にセキュリティリスクがないことを確認済み
- [ ] 変更行数が妥当な範囲内

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 10: 最終レビューゲート → `phase-10-final-review.md`
