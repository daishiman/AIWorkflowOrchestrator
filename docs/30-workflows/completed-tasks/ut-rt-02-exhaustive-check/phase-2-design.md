# Phase 2: 設計

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 2                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

`executeAsync()` の exhaustive switch 化設計と、`RuntimeSkillCreatorFacade.ts` 内に閉じる module-local `assertNever` の配置先を確定する。Phase 3 レビューゲートに耐えられる設計書を作成する。

## 実行タスク

- assertNever配置設計: `RuntimeSkillCreatorFacade.ts` 内の module-local helper として配置
- switch化設計: raw union を正規化 helper で分類してから exhaustive switch に変換
- 型定義確認: discriminated union の判別子が literal 型であることを検証
- テストケース設計: Phase 4 で作成するテストの TC 一覧を策定

## 参照資料

| 資料名             | パス                                                                                        | 説明                       |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 成果物     | `outputs/phase-1/requirements.md`                                                           | assertNever有無・union型   |
| 実装対象ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       | 設計変更対象               |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | TypeScript union型パターン |

## 実行手順

### ステップ1: assertNever 配置設計

配置先は `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の module-local helper とする。

- 新規の shared utility file は作らない
- 既存 renderer 側の helper も import しない
- exhaustiveness check はこのモジュール内に閉じる

### ステップ2: switch化の設計

現在の `if (!result.success)` パターンを、そのまま raw union に当てるのではなく、**薄い正規化 helper** を挟んでから exhaustive switch に変換する設計：

```typescript
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

const outcome = classifyExecuteResult(executeResult);

switch (outcome) {
  case "terminal_handoff":
    // terminal handoff パス
    break;
  case "success":
    // success パス
    break;
  case "error":
    // structured / execution error パス
    break;
  default:
    assertNever(outcome);
}
```

**注意**: raw union を直接分岐しない。分類 helper で正規化してから `switch(outcome)` に進み、default case と helper の終端の両方で `assertNever` を使う。

### ステップ3: 型定義の検証

Phase 1 で確認した union 型バリアントについて：

| バリアント                              | 判別子プロパティ | 期待値     | literal型か |
| --------------------------------------- | ---------------- | ---------- | ----------- |
| RuntimeSkillCreatorTerminalHandoff      | （要確認）       | （要確認） | （要確認）  |
| RuntimeSkillCreatorExecuteErrorResponse | （要確認）       | （要確認） | （要確認）  |
| SkillExecuteResult                      | （要確認）       | （要確認） | （要確認）  |

`boolean` 型の判別子では discriminated union にならないため、`true`/`false` の literal 型が必要。

### ステップ4: テストケース設計（Phase 4 向け）

| TC ID | テスト名                                    | 目的                                                     |
| ----- | ------------------------------------------- | -------------------------------------------------------- |
| TC-01 | 既存テスト T-01〜T-06 が全 PASS（回帰確認） | switch化後も振る舞いが変わらないことを確認               |
| TC-07 | switch 網羅性テスト（型レベル）             | 全 case が網羅されていることを型検査で確認               |
| TC-08 | unknown variant の smoke test               | public seam 経由で未対応バリアントが拒否されることを確認 |

### ステップ5: 変更ファイル一覧

| 種別 | ファイルパス                                                                                      | 変更内容                                                   |
| ---- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | executeAsync()をswitch化                                   |
| 修正 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | classifyExecuteResult() と module-local assertNever を実装 |
| 修正 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 回帰テストの確認・最小修正                                 |

## 統合テスト連携

| 連携項目           | 内容                                    |
| ------------------ | --------------------------------------- |
| 統合ポイント確認   | IPC変更なし・Main Process内部変更のみ   |
| 既存テスト影響範囲 | T-01〜T-06 の回帰確認が必要             |
| 型チェック戦略     | `pnpm --filter @repo/desktop typecheck` |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                                  |
| ------------------ | ---- | --------------------------------------------------------- |
| アーキテクチャ     | ✅   | assertNever が module-local で閉じているか                |
| エラーハンドリング | ✅   | 全バリアントのエラーパスが switch case で網羅されているか |
| 型安全性           | ✅   | discriminated unionの判別子がliteral型になっているか      |
| UI/UX              | N/A  | UI変更なし                                                |

## 成果物

| 成果物 | パス                        | 説明                                  |
| ------ | --------------------------- | ------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | assertNever配置決定・switch化設計詳細 |

## 完了条件

- [ ] assertNever の配置先が module-local helper で確定している
- [ ] switch 文の全 case が設計されている（バリアントと判別子が明記）
- [ ] 変更ファイル一覧が確定している（新規/修正）
- [ ] Phase 4 向けテストケース TC-01〜TC-08 が設計されている
- [ ] 型定義の判別子プロパティが literal 型であることが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 2
```
