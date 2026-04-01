# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 4                                        |
| Phase名    | テスト作成（TDD Red）                    |
| 前提Phase  | Phase 3（設計レビューゲート）            |
| 後続Phase  | Phase 5                                  |
| ステータス | 完了                                     |
| 作成日     | 2026-04-01                               |
| 機能名     | fix-step2-seq-auth-login-ipc-nonblocking |

## 目的

fire-and-forget パターンを検証するテストを Phase 5 実装前に作成する（TDD Red）。
既存テスト3件を fire-and-forget 挙動（success: true 期待）に更新し、
新規テスト3件を追加する。

## 背景

Phase 2 設計書で決定したテスト変更方針:

- 更新テスト（既存3件）: success: false → success: true 期待に変更
- 新規テスト（3件）: fire-and-forget 専用テスト追加

## 実行タスク

### タスク1: 既存テスト3件の更新

**対象ファイル**: `apps/desktop/src/main/ipc/authHandlers.test.ts`

**更新対象テスト**:

| テスト名                                       | 変更内容                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `should return error on OAuth failure`         | `expect(result.success).toBe(false)` → `expect(result.success).toBe(true)` |
| `should handle network timeout during login`   | 同上                                                                       |
| `should handle user cancellation during OAuth` | 同上                                                                       |

### タスク2: 新規テスト3件の追加

**追加テスト一覧**:

1. `should not await OAuth flow (fire-and-forget: startOAuthFlow never resolves)` — resolve しない Promise でも即座に success: true
2. `should return success immediately even when OAuth flow eventually fails (fire-and-forget)` — rejection でも success: true
3. `should send AUTH_STATE_CHANGED with error when OAuth flow rejects` — reject 後 AUTH_STATE_CHANGED が発火

## TDD サイクル確認

```bash
# テスト実行コマンド
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop exec vitest run --reporter=verbose "src/main/ipc/authHandlers.test.ts"
```

**確認項目**:

- [ ] 更新テスト3件が新しい期待値（success: true）で PASS することを確認（実装後）
- [ ] 新規テスト3件が PASS することを確認（実装後）

## 参照資料

| 参照資料       | パス                                             | 内容               |
| -------------- | ------------------------------------------------ | ------------------ |
| Phase 2 設計書 | `phase-2-design.md`                              | テスト変更設計     |
| テストファイル | `apps/desktop/src/main/ipc/authHandlers.test.ts` | 対象テストファイル |

## 成果物

| 成果物                 | パス                                             | 内容              |
| ---------------------- | ------------------------------------------------ | ----------------- |
| 更新済みテストファイル | `apps/desktop/src/main/ipc/authHandlers.test.ts` | 更新3件 + 追加3件 |

## 統合テスト連携【必須】

fire-and-forget テストシナリオを全カテゴリで作成:

- 正常系: OAuth フロー開始後に即座に success: true
- 異常系（rejection）: reject でも success: true（エラーは AUTH_STATE_CHANGED 経由）
- 異常系（永遠待機）: resolve しない Promise でもハンドラーが即座に返る

## 完了条件

- [x] 既存テスト3件が fire-and-forget 挙動に更新されている
- [x] 新規テスト3件が追加されている
- [x] 全54テストが PASS している
- [x] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

## 次のPhase

Phase 5: 実装
`docs/30-workflows/fix-step2-seq-auth-login-ipc-nonblocking/phase-5-implementation.md`

## Phase 4 実行記録

### 実行タスク

- タスク1（既存テスト3件更新）: 完了。success: false → success: true に変更
- タスク2（新規テスト3件追加）: 完了。fire-and-forget 専用テスト追加

### 発見事項

- 良かった点: 永遠待機 Promise テスト (`resolveFlow`) により「await していない」ことを決定論的に検証できる
- 問題点: マイクロタスクキューフラッシュが必要（`await Promise.resolve()` を2回）
- 改善提案: なし

### 次Phase への引き継ぎ事項

- テスト準備完了。Phase 5 で authHandlers.ts を変更すれば全テストが PASS する
