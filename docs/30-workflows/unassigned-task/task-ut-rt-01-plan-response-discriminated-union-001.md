# TASK-UT-RT-01-PLAN-RESPONSE-DISCRIMINATED-UNION-001

## 1. メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| タスクID | TASK-UT-RT-01-PLAN-RESPONSE-DISCRIMINATED-UNION-001 |
| 種別     | follow-up / refactoring                             |
| 優先度   | Low                                                 |
| 親タスク | TASK-RT-01                                          |
| 作成日   | 2026-03-29                                          |
| 状態     | open                                                |

## 2. 背景

TASK-RT-01 で `RuntimeSkillCreatorPlanResponse` を `RuntimeSkillCreatorPlanResult | RuntimeSkillCreatorPlanErrorResponse` の union type として拡張した。しかし現状の union type は `success` フィールドによる discriminated union パターンになっておらず、型の絞り込みに `'errorCode' in response` のような in 演算子チェックが必要な状態。

```typescript
// 現状（skillCreator.ts）
export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | RuntimeSkillCreatorPlanErrorResponse;
```

Discriminated union パターン（`success: true` / `success: false` の literal type）に整理することで、コード側での型ガードが簡潔になり、型安全性も向上する。

### 苦戦箇所（TASK-RT-01 より引継ぎ）

- TASK-RT-01 の Phase 2 設計で discriminated union パターンを検討したが、既存の union type 構造に合わせた再設計が必要となり、Phase 5 実装時に設計との乖離が発生した（`skill-feedback-report.md` 参照）。
- Facade の `plan()` 呼び出し元（IPC ハンドラー）での型ガード変更が必要になるため、破壊的変更の影響範囲評価が必要。

## 3. 実施スコープ

- `RuntimeSkillCreatorPlanResult` に `success: true` を追加する
- `RuntimeSkillCreatorPlanErrorResponse` に `success: false` を追加する（すでに含まれている可能性あり）
- `RuntimeSkillCreatorPlanResponse` の discriminated union を `success` フィールドで絞り込めるようにする
- IPC ハンドラー（`ipc/index.ts`）の型ガードを更新する
- 同パターンを `execute()` / `improve()` のレスポンス型にも適用検討

### スコープ外

- `execute()` / `improve()` のエラーガード実装（`TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001` に委任）

## 4. 成果物

- `packages/shared/src/types/skillCreator.ts` — `success` フィールドによる discriminated union に整理
- `apps/desktop/src/main/ipc/index.ts` — 型ガード更新
- テスト: 型ガードロジックの更新に伴うテスト修正

## 5. 完了条件

- `RuntimeSkillCreatorPlanResponse` が `success` フィールドで型が絞り込めるようになっている
- `if (response.success)` / `if (!response.success)` で正しく型が narrowing される
- `'errorCode' in response` のような in 演算子チェックが不要になっている
- 既存テストがリグレッションなし
- TypeScript コンパイルエラーなし
