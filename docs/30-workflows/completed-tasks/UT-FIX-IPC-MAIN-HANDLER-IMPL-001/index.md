# タスク仕様書 — UT-FIX-IPC-MAIN-HANDLER-IMPL-001

## メタ情報

| 項目         | 値                                            |
| ------------ | --------------------------------------------- |
| タスクID     | UT-FIX-IPC-MAIN-HANDLER-IMPL-001              |
| タスク名     | IPC mainハンドラ 未実装チャネル実装           |
| 種別         | bugfix（CIのRule-2違反解消）                  |
| ステータス   | completed                                     |
| 作成日       | 2026-04-15                                    |
| 担当者       | -                                             |
| 依存関係     | なし（TASK-1と並列実行可能）                  |
| 並列実行可能 | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001（TASK-1） |
| 親タスク     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001            |

---

## 1. 概要

`scripts/verify-ipc-4layer.cjs` が検証する Rule-2（preloadの `ALLOWED_INVOKE_CHANNELS` にあるが mainハンドラが未実装）の違反を解消する。

対象違反チャネル数: **8チャネル**

### 背景

`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に以下の8チャネルが登録されているが、`apps/desktop/src/main/ipc/` 配下に `ipcMain.handle()` 実装が存在しない。

| チャネル                   | 追加先ファイル     |
| -------------------------- | ------------------ |
| `auth:start-oauth-flow`    | `authHandlers.ts`  |
| `auth:test-callback`       | `authHandlers.ts`  |
| `settings:get`             | `storeHandlers.ts` |
| `settings:update`          | `storeHandlers.ts` |
| `agent:get-skills`         | `agentHandlers.ts` |
| `agent:get-skill-detail`   | `agentHandlers.ts` |
| `agent:execute`            | `agentHandlers.ts` |
| `agent:permission-respond` | `agentHandlers.ts` |

---

## 2. Phase 一覧

| Phase | ドキュメント                 | 内容                             | ステータス |
| ----- | ---------------------------- | -------------------------------- | ---------- |
| 4     | phase-4-test-creation.md     | テスト方針・テスト追加箇所の定義 | completed  |
| 5     | phase-5-implementation.md    | 実装指示（コードスニペット付き） | completed  |
| 6     | phase-6-test-expansion.md    | 型チェック・回帰テスト確認       | completed  |
| 7     | phase-7-coverage-check.md    | 8チャネル全実装の確認            | completed  |
| 8     | phase-8-refactoring.md       | 重複整理・委譲パターン適用       | completed  |
| 9     | phase-9-quality-assurance.md | 品質確認・セキュリティ検証       | completed  |
| 10    | phase-10-final-review.md     | 受け入れ条件確認・GO判定         | completed  |
| 11    | phase-11-manual-test.md      | 手動テスト・開発環境確認         | completed  |
| 12    | phase-12-documentation.md    | ドキュメント更新・知見追記       | completed  |
| 13    | phase-13-pr-creation.md      | PR作成指示                       | completed  |

> Phase 1〜3（要件定義・設計・設計レビュー）は親タスク `UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001` の `docs/30-workflows/ipc-4layer-fix-lane/` 以下に集約されているため、本タスクはPhase 4から開始する。

---

## 3. 変更対象ファイル

| ファイルパス                                 | 変更内容                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`  | `auth:start-oauth-flow` `auth:test-callback` ハンドラ追加                                           |
| `apps/desktop/src/main/ipc/storeHandlers.ts` | `settings:get` `settings:update` ハンドラ追加                                                       |
| `apps/desktop/src/main/ipc/agentHandlers.ts` | `agent:get-skills` `agent:get-skill-detail` `agent:execute` `agent:permission-respond` ハンドラ追加 |
| `apps/desktop/src/main/ipc/index.ts`         | 変更不要（新規ファイルなしのため追加登録なし）                                                      |

---

## 4. 実行コマンド

### 実装前の確認コマンド

```bash
# 重複ハンドラ確認
grep -rn "auth:start-oauth-flow\|auth:test-callback\|settings:get\|settings:update\|agent:get-skills\|agent:get-skill-detail\|agent:execute\|agent:permission-respond" apps/desktop/src/main/ --include="*.ts"

# authHandlers.ts の現在の構造確認
grep -n "ipcMain.handle\|registerAuthHandlers" apps/desktop/src/main/ipc/authHandlers.ts

# agentHandlers.ts の現在の構造確認
grep -n "ipcMain.handle\|register" apps/desktop/src/main/ipc/agentHandlers.ts

# storeHandlers.ts の現在の構造確認
grep -n "ipcMain.handle\|registerStoreHandlers" apps/desktop/src/main/ipc/storeHandlers.ts
```

### 検証コマンド

```bash
# Rule-2 PASS確認
node scripts/verify-ipc-4layer.cjs

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# ユニットテスト
pnpm --filter @repo/desktop test
```

---

## 5. 設計方針サマリー

1. **`auth:test-callback`**: 本番環境ガード `process.env.NODE_ENV !== 'production'` を必須とする
2. **`settings:get/update`**: `storeHandlers.ts` に集約し、settings 専用ファイルは作らない
3. **`agent:get-skills`**: 既存の `skillHandlers.ts` の `skill:list` ロジックへ委譲する
4. **`agent:execute` / `agent:permission-respond`**: 既存の `ExecutionManager` / `ApprovalGate` に委譲する
5. **any型禁止**: すべての実装で TypeScript の strict 型を使用すること

---

## 6. 受け入れ条件

- [x] `node scripts/verify-ipc-4layer.cjs` の Rule-2 がすべて PASS
- [x] `pnpm --filter @repo/desktop typecheck` でエラーなし
- [x] `pnpm --filter @repo/desktop lint` でエラーなし（0 errors）
- [x] `pnpm --filter @repo/desktop test` で既存テストが全PASS（102件）
- [x] `auth:test-callback` に本番環境ガードが実装されている
- [x] any型を使用していない

---

## 7. 関連ドキュメント

| ドキュメント                    | パス                                                             |
| ------------------------------- | ---------------------------------------------------------------- |
| 要件定義                        | `docs/30-workflows/ipc-4layer-fix-lane/phase-1-requirements.md`  |
| 設計書                          | `docs/30-workflows/ipc-4layer-fix-lane/phase-2-design.md`        |
| 設計レビュー                    | `docs/30-workflows/ipc-4layer-fix-lane/phase-3-design-review.md` |
| preloadチャネル（TASK-1）仕様書 | `docs/30-workflows/UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001/`         |
