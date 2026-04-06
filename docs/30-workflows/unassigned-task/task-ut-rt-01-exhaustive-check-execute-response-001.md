# TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001

## 1. メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| タスクID | TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001    |
| 種別     | follow-up / quality                                    |
| 優先度   | Medium                                                 |
| 親タスク | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 |
| 作成日   | 2026-04-06                                             |
| 状態     | open                                                   |

## 2. 背景

`executeAsync()` の `isStructuredError` 判定は `success === false` チェックのみで、`RuntimeSkillCreatorExecuteErrorResponse` と `SkillExecuteResult（success:false）` を区別しない。

現状の union 型:

```typescript
type RuntimeSkillCreatorExecuteResult =
  | RuntimeSkillCreatorTerminalHandoff
  | RuntimeSkillCreatorExecuteErrorResponse
  | SkillExecuteResult;
```

将来この union が拡張された場合、switch/exhaustive パターンがなければ新ケースが静的に検出されない。

### 発見ソース

TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 Phase 3 設計レビュー（未タスク候補欄）

## 3. 実施スコープ

- `RuntimeSkillCreatorFacade.ts` の `executeAsync()` における `isStructuredError` 条件を exhaustive switch に置換する
- TypeScript の `never` 型を使った exhaustive check パターンを導入する
- 対応するテストを追加する

## 4. 依存関係

| 依存 | 内容                     |
| ---- | ------------------------ |
| なし | 独立タスクとして実施可能 |

## 5. 備考

現時点では inline 条件式で十分。将来 union 型拡張時に対応する。
