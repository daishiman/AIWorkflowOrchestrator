# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 7                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 6 完了後のテストカバレッジを計測し、受入基準（Line 80%+、Branch 60%+、Function 80%+）を達成していることを確認する。基準未達の場合は対処方針に従いテストを補完する。

---

## 前提条件

| 条件                                         | 確認コマンド                                                          |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Phase 5 実装が完了していること               | `HooksFactory.ts` 内の `TODO(human)` が実装コードに置き換えられている |
| Phase 6 エッジケース整理が反映されていること | `HooksFactory.producer.test.ts` に計 7 件のテストが存在する           |
| 全テストが PASS していること                 | `pnpm --filter @repo/desktop test -- HooksFactory.producer.test.ts`   |

---

## カバレッジ計測コマンド

```bash
# HooksFactory.ts のカバレッジ計測
pnpm --filter @repo/desktop test -- --coverage \
  apps/desktop/src/main/services/agent/HooksFactory.ts

# または vitest の coverage reporter を使用する場合
pnpm --filter @repo/desktop vitest run \
  --coverage \
  --coverage.include="apps/desktop/src/main/services/agent/HooksFactory.ts" \
  apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts \
  apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts
```

---

## 受入基準（カバレッジ）

| 指標     | 基準 | 根拠                                                                                                      |
| -------- | ---- | --------------------------------------------------------------------------------------------------------- |
| Line     | 80%+ | 主要ロジック（危険コマンド検出・IPC 送信）をカバー                                                        |
| Branch   | 60%+ | 危険/安全コマンドの分岐と破棄済みウィンドウの分岐をカバー                                                 |
| Function | 80%+ | `createHooks` / `createPreToolUseHook` / `createPostToolUseHook` / `createPermissionRequestHook` をカバー |

---

## 通過条件

| 指標     | 計測値               | 判定           |
| -------- | -------------------- | -------------- |
| Line     | \_\_% （計測後記入） | 80%+ なら PASS |
| Branch   | \_\_% （計測後記入） | 60%+ なら PASS |
| Function | \_\_% （計測後記入） | 80%+ なら PASS |

全指標が基準を上回れば Phase 7 PASS。1 つでも下回れば「失敗時の対処」を実施する。

---

## 失敗時の対処

### Line カバレッジ < 80%

カバーされていない行を特定し、以下を確認する:

```bash
# カバレッジ HTML レポートを確認（行ごとの詳細）
open coverage/apps/desktop/src/main/services/agent/HooksFactory.ts.html
```

対処:

| 未カバー箇所                                       | 追加テスト案                                |
| -------------------------------------------------- | ------------------------------------------- |
| `PermissionRequest` Hook の処理                    | Permission 応答 ALLOW / DENY のテストを追加 |
| `PostToolUse` Hook の処理                          | ツール完了時の IPC 送信テストを追加         |
| `PermissionResolver.resolveRequest()` の未解決分岐 | `requestId` が存在しない場合のテストを追加  |

### Branch カバレッジ < 60%

未カバーの分岐を特定する:

| 未カバー分岐候補                                           | 追加テスト案                                            |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| `waitForResponse` の `signal.aborted` → true 分岐          | `beforeEach` で `controller.abort()` した後に呼ぶテスト |
| `resolveRequest` で `pending` が存在しない場合             | 未登録 `requestId` で `resolveRequest` を呼ぶテスト     |
| `postToolUseHook` 内の `webContents.send` が呼ばれない分岐 | 破棄済みウィンドウで PostToolUse を呼ぶテスト           |

### Function カバレッジ < 80%

カバーされていない関数を特定する:

```
確認対象:
- createHooks()
- createPreToolUseHook()（内部クロージャ）
- createPostToolUseHook()（内部クロージャ）
- createPermissionRequestHook()（内部クロージャ）
- PermissionResolver.waitForResponse()
- PermissionResolver.resolveRequest()
```

---

## 各テストと対応カバレッジの対応表

| テスト                                  | カバーする主な行・分岐                                                      |
| --------------------------------------- | --------------------------------------------------------------------------- |
| テスト 1: 危険コマンド検出→pushApproval | `if (command.includes(pattern))` true 分岐 + `pushApprovalRequest` 呼び出し |
| テスト 2: sessionId が正しく渡される    | ペイロード生成行                                                            |
| テスト 3: UUID 形式 operationId         | `uuidv4()` 呼び出し行                                                       |
| テスト 4: operationType 確認            | ペイロード定数行                                                            |
| テスト 5: 安全コマンドでは不呼び出し    | `if (command.includes(pattern))` false 分岐 + `return { proceed: true }`    |
| テスト 6: mainWindow 破棄済み           | 破棄済みウィンドウでの呼び出し経路                                          |
| テスト 7: 複数パターン→1回のみ発火      | `for` ループ早期 `return` 分岐                                              |
| E-1: mainWindow 破棄済みフォールバック  | `pushApprovalRequest` 内部ガード分岐                                        |
| E-2: 複数パターン共存                   | `for` ループの複数パターンマッチ                                            |
| E-3: AbortSignal 中断                   | 別スコープ                                                                  |

---

## 統合テストカバレッジ確認

IPC 経路（`approvalHandlers.push.test.ts`）のカバレッジも確認する:

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  --coverage.include="apps/desktop/src/main/ipc/approvalHandlers.ts" \
  apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts
```

| 指標     | 目標値 | 根拠                                       |
| -------- | ------ | ------------------------------------------ |
| Line     | 100%   | `pushApprovalRequest` の全行がテストされる |
| Branch   | 100%   | `isDestroyed` の true/false 両方をカバー   |
| Function | 100%   | `pushApprovalRequest` 単一関数のみ         |

---

## Phase 7 完了後の確認事項

Phase 7 PASS 後は以下の全受入基準が達成済みとなる:

| AC   | 基準                                                     | 達成確認         |
| ---- | -------------------------------------------------------- | ---------------- |
| AC-1 | `createPreToolUseHook()` が `pushApprovalRequest` を呼ぶ | Phase 5 で確認   |
| AC-2 | ペイロードに `sessionId` / `operationId` が含まれる      | Phase 5 で確認   |
| AC-3 | `operationId` が UUID 形式                               | Phase 5 で確認   |
| AC-4 | IPC 経路テストが通ること                                 | Phase 5 で確認   |
| AC-5 | DI チェーン経由で `approvalGate` / `sessionId` が渡る    | Phase 3 確認済み |

| カバレッジ指標                | 基準 | Phase 7 確認   |
| ----------------------------- | ---- | -------------- |
| ユニットテスト Line           | 80%+ | Phase 7 で確認 |
| ユニットテスト Branch         | 60%+ | Phase 7 で確認 |
| ユニットテスト Function       | 80%+ | Phase 7 で確認 |
| IPC 経路テスト（統合）        | 100% | Phase 7 で確認 |
| 正常系シナリオ                | 100% | Phase 7 で確認 |
| 異常系シナリオ（破棄 Window） | 80%+ | Phase 7 で確認 |

---

---

## 参照資料

| 資料名                    | パス                                                   | 説明                   |
| ------------------------- | ------------------------------------------------------ | ---------------------- |
| phase-1-requirements.md   | `./phase-1-requirements.md`                            | FR / NFR / 受入基準    |
| phase-4-test-creation.md  | `./phase-4-test-creation.md`                           | RED テスト仕様         |
| phase-5-implementation.md | `./phase-5-implementation.md`                          | 実装仕様               |
| phase-6-test-expansion.md | `./phase-6-test-expansion.md`                          | エッジケーステスト仕様 |
| HooksFactory.ts           | `apps/desktop/src/main/services/agent/HooksFactory.ts` | 実装対象               |

---

## 成果物

| 成果物             | パス                        | 説明       |
| ------------------ | --------------------------- | ---------- |
| カバレッジ確認仕様 | `phase-7-coverage-check.md` | 本ファイル |

---

## 完了条件

- [ ] カバレッジ計測コマンドを実行し、Line / Branch / Function の計測値が記録されている
- [ ] Line 80%+ を達成している
- [ ] Branch 60%+ を達成している
- [ ] Function 80%+ を達成している
- [ ] 未達の指標がある場合、「失敗時の対処」を実施してテストを補完している
- [ ] AC-1〜AC-5 の受入基準が全て達成済みであることが確認されている
- [ ] `tsc --noEmit` が 0 エラーで通過する
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 8 以降: `index.md` を参照

## 実行タスク

- current contract の coverage を確認する
- 依存関係ごとの検証漏れを洗い出す
- 追加した producer 経路の回帰観点を固定する

## 統合テスト連携

- Phase 5/6 のテスト結果を最終的な coverage 判定に反映する
- Phase 8 のリファクタリングで回帰しないことを確認する
