# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 9                                           |
| Phase名    | 品質保証                                    |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001   |
| タスク名   | Skill Creator runtime channel shared 正本化 |
| 前提Phase  | Phase 8: リファクタリング                   |
| 後続Phase  | Phase 10: 最終レビューゲート                |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-06                                  |

## 目的

line budget・link・mirror parity を一括判定し、全テスト・型チェック・Lint・後方互換性の各品質ゲートを通過することを確認する。

## 背景

Phase 8 までのリファクタリングが完了した状態で、最終レビュー（Phase 10）に進む前に品質基準を客観的に検証する。本タスクは Skill Creator runtime 系 3 チャンネル（`SKILL_CREATOR_PROGRESS`、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED`、`SKILL_CREATOR_ADAPTER_STATUS_CHANGED`）の shared 移行タスクであり、preload allowlist のセキュリティ影響があるため品質保証を実施する。

## 品質チェックリスト

### 機能検証

- [ ] 全ユニットテスト PASS
- [ ] cross-layer parity テストが全 3 チャンネルで PASS
- [ ] `packages/shared/src/ipc/__tests__/channels.test.ts` の新規テストが green
- [ ] `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` の parity テストが green
- [ ] 既存の `approvalHandlers` / `executionHandlers` テストに回帰なし

### コード品質

- [ ] ESLint エラーなし
- [ ] Prettier フォーマット適用済み
- [ ] コメント・JSDoc が正確

### テスト網羅性

- [ ] 新規追加 3 チャンネル全てがテストでカバーされている
- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%

### セキュリティ

- [ ] preload allowlist にセキュリティリスクのあるチャンネルが追加されていない
- [ ] `ALLOWED_ON_CHANNELS` の 3 チャンネルがファイルシステム・シェル・認証バイパスに該当しない
- [ ] 既存の allowlist ポリシーに違反していない

## 実行タスク

### タスク1: 全テスト確認

**目的**: 全テストが成功していることを確認する

**実行手順**:

1. shared パッケージのテストを実行する
2. desktop パッケージのテストを実行する
3. cross-layer parity テストが 3 チャンネル全てで green であることを確認する

**実行コマンド**:

```bash
# shared パッケージテスト
pnpm --filter @repo/shared test:run

# desktop パッケージテスト
pnpm --filter @repo/desktop test:run
```

**完了基準**:

- 全ユニットテスト PASS
- 全統合テスト PASS

---

### タスク2: 型チェック

**目的**: TypeScript 型エラーがないことを確認する

**実行手順**:

1. shared パッケージの型チェックを実行する
2. desktop パッケージの型チェックを実行する
3. 型エラーが 0 件であることを確認する

**実行コマンド**:

```bash
# shared 型チェック
pnpm --filter @repo/shared typecheck

# desktop 型チェック
pnpm --filter @repo/desktop typecheck
```

**完了基準**:

- 型エラー 0 件

---

### タスク3: Lint

**目的**: ESLint エラーがないことを確認する

**実行手順**:

1. shared パッケージの Lint を実行する
2. desktop パッケージの Lint を実行する
3. エラーが 0 件であることを確認する

**実行コマンド**:

```bash
# shared Lint
pnpm --filter @repo/shared lint

# desktop Lint
pnpm --filter @repo/desktop lint
```

**完了基準**:

- ESLint エラー 0 件

---

### タスク4: 後方互換性確認

**目的**: 既存の IPC handler と ALLOWED_ON_CHANNELS が破壊されていないことを確認する

**実行手順**:

1. 既存の IPC handler（`approvalHandlers`、`executionHandlers`）が変更されていないことをコードレビューで確認する
2. `ALLOWED_ON_CHANNELS` の 3 チャンネル（`SKILL_CREATOR_PROGRESS`、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED`、`SKILL_CREATOR_ADAPTER_STATUS_CHANGED`）が正しく参照できることを確認する
3. `apps/desktop/src/preload/channels.ts` が shared からの import を使用しており、直書きが除去されていることを確認する
4. 変更行数（line budget）を `git diff --stat` で確認し、小規模タスクとして妥当な範囲（目安: 合計 100 行以内）であることを確認する

**完了基準**:

- 既存 IPC handler に破壊的変更なし
- `ALLOWED_ON_CHANNELS` の 3 チャンネルが正しく参照できる
- 変更行数が妥当な範囲内

---

## 参照資料

| 参照資料                 | パス                                                                         | 用途                    |
| ------------------------ | ---------------------------------------------------------------------------- | ----------------------- |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャンネル定義 |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                       | preload 側チャンネル    |
| shared channels test     | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | shared テスト           |
| governance bundle test   | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | parity テスト           |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                     | 前 Phase 確認           |
| outputs/phase-8          | `outputs/phase-8/refactoring-summary.md`                                     | リファクタリング結果    |

## 統合テスト連携

- 品質保証の一環として統合テスト（cross-layer parity）結果を確認する
- parity テストが品質基準（全 Green）を満たしていることを検証する
- セキュリティ観点で preload 境界のテストが適切に実施されていることを確認する

## 成果物

| 成果物           | パス                                          | 内容                             |
| ---------------- | --------------------------------------------- | -------------------------------- |
| 品質保証結果     | `outputs/phase-9/quality-assurance-result.md` | 全品質ゲートの判定結果           |
| セキュリティ確認 | `outputs/phase-9/security-check-result.md`    | preload allowlist 安全性確認結果 |

## 完了条件

- [ ] 全テスト PASS（`pnpm --filter @repo/shared test:run` / `pnpm --filter @repo/desktop test:run`）
- [ ] 型エラーなし（`pnpm --filter @repo/shared typecheck` / `pnpm --filter @repo/desktop typecheck`）
- [ ] Lint エラーなし（`pnpm --filter @repo/shared lint` / `pnpm --filter @repo/desktop lint`）
- [ ] 後方互換性確認済み（既存 IPC handler に破壊的変更なし）
- [ ] `ALLOWED_ON_CHANNELS` の 3 チャンネルが正しく参照できることを確認済み
- [ ] preload allowlist にセキュリティリスクがないことを確認済み
- [ ] `outputs/phase-9/quality-assurance-result.md` が生成されている
- [ ] `outputs/phase-9/security-check-result.md` が生成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 依存関係

| 依存 Phase | 依存成果物                                       |
| ---------- | ------------------------------------------------ |
| Phase 8    | `outputs/phase-8/refactoring-summary.md`         |
| Phase 8    | `outputs/phase-8/test-results-after-refactor.md` |

## 次のPhase

Phase 10: 最終レビューゲート → `phase-10-final-review.md`
