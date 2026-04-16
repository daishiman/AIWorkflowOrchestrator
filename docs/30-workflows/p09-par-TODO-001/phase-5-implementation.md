# Phase 5: 実装

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 対象機能   | TASK-SW-TODO-001    |
| 前提Phase  | Phase 4: テスト作成 |
| 次Phase    | Phase 6: テスト拡充 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 2 で設計したオプション（A または B）に従い、`ConversationRoundStep.tsx` のTODOコメントを整理する。
`shouldShowMainToolBadge` の動作を変えずにコメントのみを修正し、テストが Green を維持することを確認する。

## 実行タスク

### Task 1: 事前テスト確認（回帰テスト Green 確認）

実装前に既存テストが Green であることを確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep"
```

全テストが Green（またはテストが存在しない）であることを確認してから実装に進む。

### Task 2: TODOコメント整理の実装

**対象ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**対象箇所**: 行 456-489 のTODOコメント、行 116 付近の `MAIN_TOOL_BADGE_ENABLED` フラグ

#### オプション A を採用した場合

```typescript
// 変更前（行 456-489 付近）
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除

// 変更後（オプション A: TODOコメントを削除）
// 主ツールバッジを恒久的に表示する
```

`MAIN_TOOL_BADGE_ENABLED` フラグを削除する場合（方針 A-1）:

```typescript
// 変更前（行 116 付近）
const MAIN_TOOL_BADGE_ENABLED = true;

// 変更後（方針 A-1: フラグ削除・直接 true に置き換え）
// フラグ定義を削除し、参照箇所で直接 true を使用する
```

#### オプション B を採用した場合

```typescript
// 変更前（行 456-489 付近）
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除

// 変更後（オプション B: 具体的な条件に書き換え）
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ表示フラグ
// - 条件: resolveExternalIntegration が外部統合の主ツール参照を返すよう変更された後に削除
// - 参照: docs/30-workflows/skill-create-flow-gaps/ の解決策設計を参照
// - 削除時は MAIN_TOOL_BADGE_ENABLED フラグごと除去し、shouldShowMainToolBadge を直接 false に変更する
```

### Task 3: 実装後テスト確認

```bash
# 実装後のテスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep"

# 全テスト実行（回帰確認）
pnpm --filter @repo/desktop test
```

### Task 4: 型チェック確認

```bash
pnpm --filter @repo/desktop typecheck
```

AC-4: TypeScriptの型エラーが 0 件であることを確認する。

### Task 5: lint 確認

```bash
pnpm --filter @repo/desktop lint
```

## 実装上の注意事項

- コメントの追加・削除・変更のみを行い、ロジックは一切変更しない
- オプション A-1 でフラグ削除する場合は、ファイル内の `MAIN_TOOL_BADGE_ENABLED` 参照箇所を全て確認してから削除する
- `shouldShowMainToolBadge` の計算式が変わらないことをコード確認で検証する
- デバッグコードを追加した場合はコミット前に必ず削除する

## 参照資料

- `outputs/phase-4/TASK-SW-TODO-001-test-design.md` — テストケース
- `outputs/phase-2/TASK-SW-TODO-001-design.md` — 設計書

## 統合テスト連携

- `ConversationRoundStep.tsx` の外部インターフェースは変更しないため IPC/Preload 層への影響なし

## 成果物

| 成果物                                  | パス                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| TASK-SW-TODO-001-implementation-plan.md | `outputs/phase-5/TASK-SW-TODO-001-implementation-plan.md` |

## 完了条件

- [ ] 実装前に既存テストが Green であることを確認した
- [ ] TODOコメント整理（オプション A または B）が完了している
- [ ] 実装後もテストが Green を維持している
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラー
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラー

## タスク100%実行確認【必須】

- [ ] Task 1（事前テスト確認）を100%実行した
- [ ] Task 2（TODOコメント整理の実装）を100%実行した
- [ ] Task 3（実装後テスト確認）を100%実行した
- [ ] Task 4（型チェック確認）を100%実行した
- [ ] Task 5（lint 確認）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-implementation-plan.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
