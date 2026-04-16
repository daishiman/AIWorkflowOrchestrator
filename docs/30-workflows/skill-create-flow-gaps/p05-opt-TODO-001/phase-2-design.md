# Phase 2: 設計

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 1                              |
| 後続Phase  | Phase 3                              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

Phase 1 で確認した `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況に基づき、TODOコメントの整理方針（削除 or 更新）を確定し、具体的な変更内容を設計する。

## 実行タスク

- 採用パターンの確認（Phase 1 の調査結果を参照）
- パターンAの設計: TODOコメントおよび関連コードの削除方針
- パターンBの設計: TODOコメントの更新内容設計
- 変更前後の差分定義
- 検証マトリクスの定義

## 参照資料

| 資料名                    | パス                                                                                    | 用途                           |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 成果物            | `outputs/phase-1/requirements-definition.md`                                            | 採用パターン・AC参照           |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`           | 変更対象コード確認             |
| SkillCreateWizard.tsx     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                      | resolveExternalIntegration確認 |
| Phase 2 解決策設計書      | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 問題4の解決策参照              |

## 実行手順

### 1. 現在のコード状態確認

Phase 1 分析書より、対象コードの構造：

**`ConversationRoundStep.tsx:124-135`（`shouldShowMainToolBadge` 関数）**

```typescript
const MAIN_TOOL_BADGE_ENABLED = true;

function shouldShowMainToolBadge({
  questionKey,
  optionValue,
  selectedOptions,
}) {
  return (
    MAIN_TOOL_BADGE_ENABLED &&
    questionKey === "q5" &&
    selectedOptions.length >= 2 &&
    selectedOptions[0] === optionValue
  );
}
```

**`ConversationRoundStep.tsx:456-461`（TODOコメント付きの呼び出し箇所）**

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});
```

### 2. パターンA: TODOコメント削除設計（完了済みの場合）

**変更対象**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**変更内容**:

1. `:456` の TODOコメント行を削除する
2. `MAIN_TOOL_BADGE_ENABLED = true` フラグを削除し、`shouldShowMainToolBadge` 内の条件を直接 `true` で評価する形へ整理する（フラグは将来の無効化を想定したものだったが、恒久的に維持する場合はフラグ自体が不要）

**変更前後の差分（パターンA）**:

```typescript
// 変更前（:116-118）
const MAIN_TOOL_BADGE_ENABLED = true;

// 変更後: フラグを削除し、関数内の条件を直接記述
```

```typescript
// 変更前（:456-461）
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});

// 変更後: TODOコメントを削除
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});
```

### 3. パターンB: TODOコメント更新設計（未完了の場合）

**変更対象**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**変更内容**: TODOコメントを現状に即した内容へ更新する

```typescript
// 変更前（:456）
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除

// 変更後: 現状に即した内容へ更新（タスクが未完了であることを明記）
// NOTE: 主ツールバッジは q5 で複数ツール選択時に先頭オプションに表示される。
// resolveExternalIntegration（SkillCreateWizard.tsx）が selectedOptions[0] を主ツールとして参照する
// 現行ロジックと一致しているため、バッジは現在正常に機能している。
// UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 が完了し resolveExternalIntegration の参照ロジックが変更された際に
// shouldShowMainToolBadge と MAIN_TOOL_BADGE_ENABLED フラグの削除を検討すること。
```

### 4. 採用パターンの判断基準

| 判断条件                                                          | 採用パターン |
| ----------------------------------------------------------------- | ------------ |
| `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了済みで記録がある | パターンA    |
| `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が未完了または記録なし | パターンB    |

### 5. 変更スコープの限定

本タスクは**コメント変更のみ**を対象とし、以下を変更しない：

- `shouldShowMainToolBadge` 関数のロジック
- `MAIN_TOOL_BADGE_ENABLED` フラグの値（パターンBの場合）
- UIの実際の表示動作
- テストコードの既存テストケース

### 6. 検証マトリクス

| テスト対象            | テストコマンド                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------- |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`                                                       |
| ESLint                | `pnpm --filter @repo/desktop lint`                                                            |
| TODOコメント削除確認  | `grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" ConversationRoundStep.tsx`                |
| 既存テスト確認        | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/` |

## 統合テスト連携【必須】

| 判定項目   | 基準    | 結果 |
| ---------- | ------- | ---- |
| 型チェック | PASS    | -    |
| lint       | 0 error | -    |

## 多角的チェック観点

| 観点             | チェック内容                                                             |
| ---------------- | ------------------------------------------------------------------------ |
| 変更最小原則     | コメント変更のみで済む範囲に限定されているか                             |
| 後方互換性       | `shouldShowMainToolBadge` の動作が変わっていないか                       |
| トレーサビリティ | パターンBの場合、新コメントが将来の削除条件を明確に示しているか          |
| パターンA整合性  | `MAIN_TOOL_BADGE_ENABLED` フラグの整理方針がコードの意図と一致しているか |

## 成果物

| 成果物 | パス                        | 説明                                       |
| ------ | --------------------------- | ------------------------------------------ |
| 設計書 | `outputs/phase-2/design.md` | 採用パターン・変更前後差分・検証マトリクス |

## 完了条件

- [ ] 採用パターン（A または B）が Phase 1 の調査結果に基づいて確定している
- [ ] パターンAの変更前後差分が定義されている（TODOコメント削除 + フラグ整理）
- [ ] パターンBの更新後コメント内容が定義されている（削除条件を明記したNOTE）
- [ ] 変更スコープ（コメントのみ）が明示されている
- [ ] 検証マトリクスが定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 採用パターンの確認（Phase 1 成果物参照）
2. パターンAの変更設計（TODOコメント削除 + MAIN_TOOL_BADGE_ENABLED 整理）
3. パターンBの更新コメント設計
4. 変更スコープの明示
5. 検証マトリクスの定義
6. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビュー
