# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

実装前にテストコードを作成し、3パターン分岐・TerminalHandoffBundle 生成・graceful degradation の3軸でテストを設計する。IPC レスポンス wrapper 形式を Phase 2 設計書から参照して正確なアサーションを記述する（P60対策）。

## 実行タスク

1. 既存テストファイルのインポートパスを参照してから import を記述する（P63対策）:
   `grep -n "^import" apps/desktop/src/main/services/runtime/__tests__/*.test.ts`
2. パターンA テスト: apiKey が設定済みの場合に `integrated_api` が返ることを確認するテストを作成する
3. パターンB テスト: apiKey が未設定かつ subscription なしの場合に `terminal_handoff` が返ることを確認するテストを作成する
4. パターンC テスト: `ISubscriptionAuthProvider.validateToken()` が true の場合に `terminal_handoff`（subscription モード）が返ることを確認するテストを作成する
5. TerminalHandoffBundle 生成テスト: 各モード（subscription/no-auth）で正しいフィールドが設定されることを確認するテストを作成する
6. graceful degradation テスト:
   - AuthKeyService が例外を投げた場合のフォールバック動作テスト
   - subscription 判定がタイムアウトした場合のテスト
7. P60対策: IPC レスポンス形式（`{ success, data?, error? }`）を Phase 2 設計書から確認してからアサーションを記述する
8. モックの `beforeEach` リセットを確実に行う（P9対策）

## 参照資料

- `docs/30-workflows/w1b-sc-runtime-policy-closure/phase-02-design.md`
- `packages/shared/src/types/auth-mode.ts`（`ISubscriptionAuthProvider` インターフェース定義）
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`（既存 `RuntimeDecision` 型: `type` フィールド使用に注意）
- `.claude/rules/06-known-pitfalls.md#P60`（IPC レスポンス形式不一致）
- `.claude/rules/06-known-pitfalls.md#P63`（インポートパス誤り）
- `.claude/rules/06-known-pitfalls.md#P9`（モジュールスコープ変数リーク）
- `.claude/rules/06-known-pitfalls.md#P13`（タイマーテスト無限ループ）

## 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`（新規 or 更新）
- `apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts`（新規 or 更新）
- テストケース一覧（パターンA/B/C × 正常系/異常系）

## 完了条件

- [ ] パターンA（integrated_api）テストが作成されている
- [ ] パターンB（no-auth terminal_handoff）テストが作成されている
- [ ] パターンC（subscription terminal_handoff）テストが作成されている
- [ ] TerminalHandoffBundle の各モード別フィールドテストが作成されている
- [ ] graceful degradation テスト（例外/タイムアウト）が作成されている
- [ ] `pnpm vitest run` で全テストが Red（実装前のため失敗）であることを確認している

## 次のPhase

Phase 5: 実装
