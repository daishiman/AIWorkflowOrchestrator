# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 5                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

TDD の Green フェーズとして、Phase 4 で作成したテストが全て PASS するよう `executeAsync()` を exhaustive switch パターンで実装する。

## 実行タスク

- 実装計画確認: 新規作成・修正ファイルパスの一覧を確認【必須】
- assertNever追加: `RuntimeSkillCreatorFacade.ts` 内の module-local helper として配置
- switch化実装: executeAsync() の分岐を正規化 helper + switch + assertNever に変更
- 型チェック実行: `pnpm typecheck` でエラー 0 件確認
- テストGreen確認: 全テスト（T-01〜T-06 + TC-07/TC-08）が PASS

## 参照資料

| 資料名             | パス                                                                  | 説明                   |
| ------------------ | --------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書     | `outputs/phase-2/design.md`                                           | switch化の設計詳細     |
| Phase 4 テスト設計 | `outputs/phase-4/test-design.md`                                      | 実装が通すべきTCの定義 |
| 実装対象ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 変更対象               |

## 実行手順

### ステップ0: 実装計画確認【必須 - RT-03 対応】

**新規作成ファイル一覧**:

| パス | 内容                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| なし | `assertNever` は `RuntimeSkillCreatorFacade.ts` 内の module-local helper として実装する |

**修正ファイル一覧**:

| パス                                                                                              | 変更内容                         |
| ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | executeAsync() を switch 化      |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 最小限の修正（switch変更に伴う） |

> **注意**: 共有 utility は作らず、同一モジュール内の helper として閉じる。

### ステップ1: assertNever の実装（module-local helper）

```typescript
/**
 * TypeScript の exhaustive check ヘルパー関数。
 * RuntimeSkillCreatorFacade.ts の内部に閉じることで、
 * mixed union を正規化した後の exhaustive check を同一モジュールで完結させる。
 */
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
```

### ステップ2: executeAsync() の switch 化

```typescript
// apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

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

const outcome = classifyExecuteResult(executeResult);

switch (outcome) {
  case "terminal_handoff":
    // terminal_handoff パス
    break;
  case "success":
    // success パス
    break;
  case "error":
    // error パス
    break;
  default:
    assertNever(outcome);
}
```

### ステップ3: 型チェック実行

```bash
# TypeScript コンパイルエラーがないことを確認
pnpm --filter @repo/desktop typecheck
```

エラーが出た場合の対処：

- `assertNever` の行でエラー → `classifyExecuteResult()` の終端または outer switch の case 漏れ。該当 variant を追加する
- `success: boolean` → `success: true | false` の literal 型への変換が必要な場合は型定義ファイルを修正

### ステップ4: テスト Green 確認

```bash
# 全テストが PASS することを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

期待結果：

- T-01〜T-06: PASS（回帰なし）
- TC-07: PASS（exhaustive check 検証）
- TC-08: PASS（public seam 経由の unknown variant 失敗確認）

### ステップ5: exhaustive check の手動検証

```bash
# 仮バリアントを追加してコンパイルエラーを確認（手動）
# 1. RuntimeSkillCreatorExecuteResult に TestVariant を一時追加
# 2. pnpm typecheck でエラーが assertNever 行で発生することを確認
# 3. classifyExecuteResult() か outer switch に case を追加してエラーが解消することを確認
# 4. TestVariant を削除して元に戻す
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携

| 連携項目   | 内容                                   |
| ---------- | -------------------------------------- |
| 型整合確認 | IPC型定義に影響がないことを確認        |
| 回帰確認   | `pnpm test` で全体テストの PASS を確認 |

```bash
# フォーカステスト実行（全体テストのSIGKILL回避）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

## 多角的チェック観点

| 観点               | 確認内容                                                     |
| ------------------ | ------------------------------------------------------------ |
| アーキテクチャ     | assertNever の配置が module-local helper として閉じている    |
| 型安全性           | switch の全 case が union 型バリアントを網羅している         |
| エラーハンドリング | assertNever が未知バリアントに対して適切なエラーをスローする |

## 成果物

| 成果物                             | パス                                                                  | 説明                   |
| ---------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| 実装ファイル（修正）               | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | switch化完了           |
| assertNever（module-local helper） | `RuntimeSkillCreatorFacade.ts` 内の helper                            | exhaustive check用     |
| 実装サマリー                       | `outputs/phase-5/implementation-summary.md`                           | 変更内容・設計根拠記録 |

## 完了条件

- [ ] 実装計画（新規作成/修正ファイルパス一覧）が記録されている
- [ ] `assertNever` が module-local helper として配置されている
- [ ] `executeAsync()` が exhaustive switch パターンで実装されている
- [ ] helper 終端または switch の default case に `assertNever` が配置されている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件
- [ ] T-01〜T-06 が全て PASS（回帰なし）
- [ ] TC-07・TC-08 が PASS
- [ ] 仮バリアント追加時にコンパイルエラーが発生することを手動確認済み
- [ ] 実装サマリー（`outputs/phase-5/implementation-summary.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 5
```
