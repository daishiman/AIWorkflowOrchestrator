# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| 前提Phase  | Phase 7                                |
| 後続Phase  | Phase 9                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

Phase 5 で実装したコードの品質を向上させる。重複排除・可読性改善・型定義の整理を行い、全テストが PASS 状態を維持することを確認する。

---

## 実行タスク

### タスク1: コード品質チェック

**目的**: 実装コードの品質問題を洗い出す

**チェック観点**:

| 観点         | チェック項目                                                           |
| ------------ | ---------------------------------------------------------------------- |
| 型重複       | `onApprovalRequest` のペイロード型が `ExecutionAPI` と重複していないか |
| 命名一貫性   | `respondToApproval`/`getDisclosureInfo` と命名規則が統一されているか   |
| コメント品質 | JSDoc コメントが他のメソッドと同水準で記述されているか                 |
| UI 一貫性    | disclosure summary と approval request の UI 構造が対称になっているか  |
| テスト品質   | テストケース名・アサーションが明確で可読性が高いか                     |

**実行コマンド**:

```bash
# lint チェック
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### タスク2: 型定義の整理（必要な場合）

**目的**: ペイロード型の重複を解消する（該当する場合のみ）

**判断基準**:

- `ExecutionAPI.onApprovalRequest` の型（`preload/types.ts` 行1038）と完全一致する場合は共通型を検討する
- ただし、過度な抽象化は行わない（1箇所のみの利用なら型エイリアス不要）

### タスク3: リファクタリング後のテスト確認

**実行コマンド**:

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- skill-creator-api.approval
pnpm --filter @repo/desktop test -- SkillLifecyclePanel.approval

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 参照資料

| 参照資料       | パス                                                                 | 内容                 |
| -------------- | -------------------------------------------------------------------- | -------------------- |
| 実装ファイル   | `apps/desktop/src/preload/skill-creator-api.ts`                      | リファクタリング対象 |
| SkillLifecycle | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | リファクタリング対象 |

---

## 成果物

| 成果物                     | パス                                            | 内容         |
| -------------------------- | ----------------------------------------------- | ------------ |
| リファクタリング済みコード | `apps/desktop/src/preload/skill-creator-api.ts` | 品質向上済み |

---

## 完了条件

- [ ] lint エラーがない
- [ ] 型チェックが通っている
- [ ] 全テストが PASS 状態を維持している
- [ ] コードの可読性・一貫性が向上している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質保証 → [phase-9-quality-assurance.md](phase-9-quality-assurance.md)
