# Phase 2: 設計

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 2              |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 1        |
| 後続Phase  | Phase 3        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                        | 実行形態                  |
| ---------- | ------------------------------------------- | ------------------------- |
| SubAgent-D | 設計統合（Phase 1結果を元に変更仕様を確定） | **直列**（Phase 1完了後） |

## 変更箇所

**対象ファイル**: `packages/shared/src/types/skillCreator.ts`

### 変更1: `SkillCreatorUserInputSubmission` の JSDoc 追加

```typescript
export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  /**
   * @canonical 複数選択（multi_select）で選択されたオプション ID の配列。
   * multi_select 回答の正規フィールド。
   */
  selectedOptionIds?: string[];
  /**
   * @deprecated Use `selectedOptionIds` instead.
   * レガシー互換のために残存。新規実装では `selectedOptionIds` を使用すること。
   * `SkillCreatorWorkflowEngine.normalizeSelectedOptionIds` が
   * `selectedOptionIds ?? selectedValues` でフォールバックするため、
   * 既存の呼び出し側は引き続き動作するが、将来のバージョンで削除予定。
   */
  selectedValues?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

### 変更2: `InterviewUserAnswer` の JSDoc 追加

```typescript
export interface InterviewUserAnswer {
  kind: SkillCreatorUserInputKind;
  selectedOptionId?: string;
  /**
   * @canonical 複数選択（multi_select）で選択されたオプション ID の配列。
   * multi_select 回答の正規フィールド。
   */
  selectedOptionIds?: string[];
  /**
   * @deprecated Use `selectedOptionIds` instead.
   * レガシー互換のために残存。新規実装では `selectedOptionIds` を使用すること。
   */
  selectedValues?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

## 設計の根拠

`selectedOptionIds` を正規フィールドとする根拠:

1. `SkillCreatorWorkflowEngine.normalizeSelectedOptionIds` が `selectedOptionIds` を第一優先でフォールバック（`selectedOptionIds ?? selectedValues`）
2. テストコード（`SkillCreatorWorkflowEngine.test.ts`）が `selectedOptionIds` を直接参照
3. `ConversationalInterview.tsx` が UI state として `selectedOptionIds` を管理

`selectedValues` は過去の互換性のために残された冗長フィールドであり、実装側で両フィールドに同値をセットする状況が続いている。

## 検証方法

```bash
# 型チェック（@deprecated はビルドエラーにならないことを確認）
pnpm --filter @repo/shared typecheck

# lint チェック
pnpm --filter @repo/shared lint
```

## 完了条件

- [ ] 変更1・変更2の差分が確定している
- [ ] `@canonical` / `@deprecated` の JSDoc 文言が確定している
- [ ] 設計の根拠が文書化されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビュー
