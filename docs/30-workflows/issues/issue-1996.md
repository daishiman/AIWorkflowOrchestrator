# [#1996] [UT-RT-02-TYPE-EXPANSION-TEST-001] union型拡張時の回帰確認テスト

## メタ情報

```yaml
issue_number: 1996
title: [UT-RT-02-TYPE-EXPANSION-TEST-001] union型拡張時の回帰確認テスト
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-04-07
updated_date: 2026-04-07
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1996
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-RT-02-TYPE-EXPANSION-TEST-001                               |
| タスク名     | union型拡張時の回帰確認テスト手順文書化                        |
| 分類         | 品質／回帰テスト                                               |
| 対象機能     | RuntimeSkillCreatorFacade.executeAsync() exhaustive check 維持 |
| 優先度       | 低                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | UT-RT-02-EXHAUSTIVE-CHECK-001 Phase 12 未タスク検出            |
| 発見日       | 2026-04-07                                                     |
| 親タスク     | UT-RT-02-EXHAUSTIVE-CHECK-001                                  |

---

## 背景・課題

`RuntimeSkillCreatorFacade.executeAsync()` は現在の `RuntimeSkillCreatorExecuteResponse` union に対して exhaustive check を満たしている。  
ただし、将来 union に新しいバリアントが追加されたとき、型変更と回帰確認テストを同時に再実行できる検証手順が文書化されていない。

### 問題点

- union 型拡張時の回帰確認テスト手順が未文書化であり、開発者が手順を独自に組み立てる必要がある
- `assertNever()` パターンへの新バリアント追加時の確認手順が曖昧で、漏れが発生しやすい
- `classifyExecuteResult()` 分岐とテスト期待値の同期ルールが明示されていない

### 放置した場合の影響

- union に新しいバリアントが追加されても回帰確認が行われず、`assertNever()` の網羅性が崩れる
- 型変更だけ先行し、テスト・実装との乖離が発生する
- 発見が遅れるほど修正コストが増大する

---

## 目的・ゴール

union 型に新バリアントが追加された際に、`assertNever()` の網羅性と回帰テストの整合を `typecheck` と `vitest` で同時に確認できる手順を確立し、文書化する。

### 最終ゴール

- 新バリアント追加時に回帰テストが失敗として検出される状態
- `assertNever()` の網羅性が型レベルで保証されている状態
- 既存の T-01〜T-08 と TC-T4-01〜TC-T4-04 がすべて regression なしで通過する状態

---

## スコープ

### 含むもの

- `RuntimeSkillCreatorFacade.executeAsync.test.ts` への新バリアント追加時の確認ケース追加
- `assertNever()` パターンへの新バリアント追加手順の文書化
- `classifyExecuteResult()` 分岐とテスト期待値の同期ルール明示

### 含まないもの

- `RuntimeSkillCreatorExecuteResponse` 以外の union 型拡張対応
- 新バリアントの実装（拡張は別タスク）
- CI/CD パイプラインの変更

---

## 成果物

| 種別 | ファイル                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` |

---

## Phase 構成

このタスクは小規模な follow-up タスクであり、要点フェーズで実施する。

### Phase 1: 要件確認・インベントリ

既存のテストファイルと `RuntimeSkillCreatorExecuteResponse` の union 定義を確認する。

1. `packages/shared/src/types/skillCreator.ts` で `RuntimeSkillCreatorExecuteResponse` の全バリアントを確認する
2. `RuntimeSkillCreatorFacade.executeAsync.test.ts` の既存テストケース T-01〜T-08、TC-T4-01〜TC-T4-04 を確認する
3. `classifyExecuteResult()` の全分岐を確認する

**完了条件**: 全バリアントと全テストケースが対応表として整理されている。

### Phase 2: 回帰テストケース追加

新バリアント追加時に検出できる回帰ケースをテストファイルに追加する。

1. `RuntimeSkillCreatorFacade.executeAsync.test.ts` に新バリアント追加時の確認ケースを追加する
2. `assertNever()` が新バリアントで型エラーを出すことを確認する（型レベルでの失敗）
3. `classifyExecuteResult()` の期待分岐をテストで固定する

**完了条件**:

- 新バリアントを追加したとき `pnpm --filter @repo/desktop typecheck` がエラーを報告する
- 既存テストケースが全件 PASS する

### Phase 3: 検証・完了

型レベルと動作レベルの両方で回帰保護が機能していることを確認する。

1. `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` を実行する
2. `pnpm --filter @repo/desktop typecheck` を実行し、型レベルの網羅性を確認する
3. 既存テストが regression なしで通過することを確認する

**完了条件**: vitest・typecheck 両方が PASS している。

---

## 完了条件チェックリスト

### 機能要件

- [ ] 新バリアント追加時に回帰テストが失敗として検出される
- [ ] `assertNever()` の網羅性が保たれている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` が PASS
- [ ] 既存の runtime テストが regression なしで通過する

### ドキュメント要件

- [ ] `docs/30-workflows/ut-rt-02-exhaustive-check/` の成果物と整合する
- [ ] outputs/phase-12/unassigned-task-detection.md が本タスクを参照している

---

## テストケース

| TC   | 内容                                                           | 期待結果                 |
| ---- | -------------------------------------------------------------- | ------------------------ |
| TC-1 | 既存 T-01〜T-08 が全件 PASS                                    | vitest PASS              |
| TC-2 | 既存 TC-T4-01〜TC-T4-04 が全件 PASS                            | vitest PASS              |
| TC-3 | `assertNever()` が新バリアント追加時に TypeScript エラーを出す | typecheck FAIL（意図的） |

---

## 検証コマンド

```bash
# 対象テストファイルのみ実行
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts

# 型レベルの網羅性確認
pnpm --filter @repo/desktop typecheck
```

---

## 技術詳細（Phase 12 実装ガイドより）

### 現在の実装パターン

`RuntimeSkillCreatorFacade.executeAsync()` は以下のパターンで実装されている。

```typescript
// Module-local helpers for executeAsync() exhaustive switch (UT-RT-02)
type ExecuteOutcome = "success" | "error" | "terminal_handoff";

function classifyExecuteResult(result: SkillExecuteResponse): ExecuteOutcome {
  if (typeof result === "object" && result !== null && "type" in result) {
    switch (result.type) {
      case "terminal_handoff":
        return "terminal_handoff";
      default:
        return assertNever(result.type);
    }
  }
  if ("success" in result) {
    return result.success === false ? "error" : "success";
  }
  return assertNever(result);
}

function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
```

### switch + assertNever パターン

```typescript
const outcome = classifyExecuteResult(executeResult);
switch (outcome) {
  case "terminal_handoff":
  case "success":
    this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
    break;
  case "error": {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    break;
  }
  default:
    assertNever(outcome);
}
```

### 新バリアント追加時の手順

1. `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorExecuteResponse` に新バリアントを追加
2. `pnpm --filter @repo/desktop typecheck` を実行 → `assertNever` 行でコンパイルエラーが発生することを確認
3. `classifyExecuteResult()` または outer switch に case を追加してエラーを解消
4. テストを追加・実行して PASS することを確認

---

## リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                             |
| ------------------------------ | ------ | -------- | ---------------------------------------------------------------- |
| 仕様追加時にテストが追従しない | 高     | 中       | union 変更時にこのタスクを必ず再評価する                         |
| 型変更だけ先行する             | 中     | 中       | `typecheck` と `vitest` を同じ波で実行するルールを手順に明記する |
| 参照先の更新漏れ               | 低     | 低       | path 更新後に `verify-unassigned-links.js` を再実行する          |

---

## 関連ドキュメント

- `docs/30-workflows/unassigned-task/task-ut-rt-02-type-expansion-test-001.md` — 本タスク仕様書
- `docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/unassigned-task-detection.md` — 未タスク検出記録
- `docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/implementation-guide.md` — 実装ガイド
- `docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-4/test-design.md` — テスト設計

## 参考ファイル

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`
- `packages/shared/src/types/skillCreator.ts`

---

## 補足

- 現時点では予防的な follow-up タスク
- 新バリアントが実際に追加されるまで open のまま維持する
- UT-RT-02-EXHAUSTIVE-CHECK-001 の完了状態を前提とする
