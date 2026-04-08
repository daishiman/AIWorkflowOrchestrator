# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 8                                                        |
| Phase名    | リファクタリング                                         |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 7: カバレッジ確認                                  |
| 次Phase    | Phase 9: QA                                              |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

最小変更で実装した SkillLifecyclePanel.tsx を整理し、コードの可読性・保守性を向上させる。変更量が少ないため、リファクタリングスコープは限定的にする。

## 実行タスク

### Task 1: 不要コードの最終確認

Phase 5 の実装後に不要なコードが残っていないか最終確認する。

```bash
# 削除漏れの確認
rg -n "request|handleCreate|handlePrepare|skill-lifecycle-request-input|skill-lifecycle-create-button|skill-lifecycle-prepare-button" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

確認項目:

| 残存確認対象                     | 期待結果   |
| -------------------------------- | ---------- |
| `request` state 参照             | 存在しない |
| `setRequest` 参照                | 存在しない |
| `handleCreate` 参照              | 存在しない |
| `handlePrepare` 参照             | 存在しない |
| `skill-lifecycle-request-input`  | 存在しない |
| `skill-lifecycle-create-button`  | 存在しない |
| `skill-lifecycle-prepare-button` | 存在しない |

### Task 2: import 文の整理

削除したコードで使用していた import が残っていないか確認し、不要なものを削除する。

```typescript
// 確認・削除候補の例（実際の実装に依存）
// import { useState } from "react";  // request state 削除後、他でuseStateを使わない場合は削除
// import { someSkillAPI } from "..."; // handleCreate/handlePrepare でのみ使用していたAPIのimport
```

### Task 3: コメントの整理

削除したコードに関連するコメントが残っていないか確認し、削除する。

```bash
# 旧コードに関連するコメントを確認
rg -n "TODO|FIXME|依頼|生成|方針" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Task 4: 新セクションのコード品質確認

追加した「1. スキルを作成する」セクションのコードが以下の基準を満たしているか確認する:

| 確認項目                    | 基準                                               |
| --------------------------- | -------------------------------------------------- |
| Tailwind CSS クラスの一貫性 | 他のセクションと同じデザイントークンを使用している |
| `type="button"` の明示      | フォーム内でのデフォルト動作を防止している         |
| `data-testid` の付与        | `skill-lifecycle-open-wizard-button` が存在する    |
| セマンティックな HTML 構造  | `section > div > h3 + p + button` の構造           |

### Task 5: 型定義の整理

```typescript
// Props インターフェースが明確に定義されているか確認
interface SkillLifecyclePanelProps {
  onClose: () => void;
  onOpenSkillWizard: () => void;
}
// ※ 不要な型が残っていないか確認
```

### Task 6: リファクタリング後のテスト実行

```bash
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit
```

## 参照資料

| 資料名         | パス                                                                                 | 説明                 |
| -------------- | ------------------------------------------------------------------------------------ | -------------------- |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                 | リファクタリング対象 |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx` | 動作検証用           |

## 成果物

| 成果物               | パス                                                                 | 説明                   |
| -------------------- | -------------------------------------------------------------------- | ---------------------- |
| リファクタリング済み | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 整理後ファイル         |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                 | 変更内容・改善点の記録 |

## 完了条件

- [ ] 削除漏れコードが存在しない
- [ ] 不要 import が削除されている
- [ ] 旧コード関連のコメントが削除されている
- [ ] 新セクションのコード品質基準が満たされている
- [ ] 型定義が整理されている
- [ ] リファクタリング後も全テストがpassしている
- [ ] 型チェックが通過している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: QA](./phase-9-qa.md)
