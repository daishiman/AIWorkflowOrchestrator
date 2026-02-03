# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 8                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

動作を変えずに型定義のコード品質を改善する。

## 実行タスク

### Task 1: 型定義の整理

1. **セクション整理**: 型定義ファイル内のセクションコメントを統一
2. **JSDoc整理**: 全ての型に適切なJSDocコメントを追加
3. **import整理**: 不要なimportの削除

```typescript
// Before
export interface SkillStreamMessage {
  // ...
}

// After
/**
 * スキル実行時のストリーミングメッセージ
 * Discriminated Union形式で型安全に処理可能
 * @see specification.md §5.1 SkillStreamMessage
 */
export type SkillStreamMessage = /* ... */;
```

### Task 2: 型エイリアスの最適化

重複する型定義パターンを共通化する。

```typescript
// 共通のベースプロパティを抽出
interface BaseStreamMessage {
  executionId: string;
  timestamp: number;
}

export type SkillStreamMessage =
  | (BaseStreamMessage & {
      type: "assistant";
      content: AssistantMessageContent;
    })
  | (BaseStreamMessage & { type: "tool_use"; content: ToolUseMessageContent });
// ...
```

### Task 3: 不要ファイルの削除

`skill-execution.ts` が空になった場合は削除する。

```bash
# ファイル削除
rm packages/shared/src/types/skill-execution.ts

# index.ts からのエクスポート削除確認
grep "skill-execution" packages/shared/src/types/index.ts
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm test
pnpm typecheck
```

## 成果物

| 成果物         | パス                                 | 説明               |
| -------------- | ------------------------------------ | ------------------ |
| 整理済み型定義 | `packages/shared/src/types/skill.ts` | リファクタリング後 |

## 完了条件

- [ ] テストが継続成功
- [ ] 型定義のコード品質が改善されている
- [ ] 重複コードが排除されている
- [ ] 不要ファイルが削除されている
- [ ] JSDocコメントが整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test
pnpm typecheck

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
