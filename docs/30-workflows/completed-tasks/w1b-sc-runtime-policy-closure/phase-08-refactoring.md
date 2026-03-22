# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 8                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

Phase 5 で実装した subscription 判定ロジックを簡素化し、`resolve()` メソッドの可読性を高める。長い分岐ロジックを小さなプライベートメソッドに分解し、テスタビリティを維持したまま保守性を向上させる。

## 実行タスク

1. `resolve()` メソッドが30行を超える場合は以下のプライベートメソッドに分解する:
   - `hasValidApiKey(): boolean`
   - `isSubscriptionValid(): Promise<boolean>`（`ISubscriptionAuthProvider.validateToken()` 委譲）
   - `buildTerminalHandoffBundle(source: 'subscription' | 'no-auth'): TerminalHandoffBundle`
2. subscription 判定の条件式が複雑な場合は名前付き変数に抽出して意図を明確にする
3. `try/catch` ブロックの catch 節がエラーを握りつぶしていないことを確認する
4. non-null assertion（`!`）を `?.` / `Array.isArray()` に置換する（P48対策）
5. 未使用 import を除去する
6. TypeScript の型推論が正しく機能しているか確認する（`as` キャストを除去できるか確認する）
7. リファクタリング後に `pnpm vitest run` を実行し全テストが Green であることを確認する

## 参照資料

- `docs/30-workflows/w1b-sc-runtime-policy-closure/phase-05-implementation.md`
- `packages/shared/src/types/auth-mode.ts`（DI 対象インターフェース定義）
- `.claude/rules/06-known-pitfalls.md#P48`（non-null assertion）
- `.claude/rules/06-known-pitfalls.md#P49`（type predicate 内での as キャスト）
- `.claude/rules/02-code-quality.md#コーディング規約`

## 成果物

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`（リファクタリング後）
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`（リファクタリング後）

## 完了条件

- [ ] `resolve()` メソッドが30行以下に簡素化されている（または分解された場合はその根拠が記録されている）
- [ ] プライベートメソッドへの分解が行われている
- [ ] non-null assertion が除去されている
- [ ] エラーが握りつぶされていない
- [ ] `pnpm vitest run` で全テストが Green である
- [ ] `pnpm typecheck` が PASS している

## 次のPhase

Phase 9: 品質検証
