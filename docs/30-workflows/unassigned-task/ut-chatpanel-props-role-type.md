# UNASSIGNED-02: ChatPanelProps role 型追加の検討

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UNASSIGNED-02                                   |
| 優先度   | 低                                              |
| 元タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 検出元   | Phase 3 設計レビュー MINOR-B                    |
| 検出日   | 2026-03-23                                      |

---

## 概要

`ChatPanelProps` に `role?: 'mainline' | 'review-harness'` 型を追加することで、
コンパイル時にコンポーネントの役割を型で表現できるかどうかを評価・決定する。

## 背景

Phase 3 設計レビューで「ChatPanelProps role 型追加の要否再評価」として指摘された。
現状は JSDoc コメント `@role review-harness` で役割を記述しているが、
型として表現することでコンパイル時の検証が可能になる。

ただし `role` は HTML 標準属性（`aria-role` 相当）との衝突リスクがあり、
P46（HTMLAttributes 型衝突パターン）の対策が必要。

## スコープ

### 含むもの

- ChatPanel の呼び出し箇所の調査
- `role` の HTML 標準属性との衝突評価（P46 対策）
- 型追加するか JSDoc で代替するかの決定と記録

### 含まないもの

- 他コンポーネントへの同様の型追加（本タスクは ChatPanel のみ）
- ChatPanel のロジック変更

## 調査コマンド

```bash
# ChatPanel の呼び出し箇所を調査
grep -rn "ChatPanel" apps/desktop/src/renderer/ --include="*.tsx"
grep -rn "ChatPanel" apps/desktop/src/ --include="*.stories.tsx"
```

## 実装方針（型追加を選択した場合）

P46 対策として `Omit` で衝突属性を除外してからカスタム型を定義する。

```typescript
// P46 対策: Omit で role 属性を除外（role は HTMLAttributes に存在しないが念のため）
export interface ChatPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "role"
> {
  role?: "mainline" | "review-harness";
  // ... 既存 props
}
```

## 受入基準

- [ ] ChatPanel の呼び出し箇所を調査した
- [ ] `role` の HTML 標準属性との衝突を評価した（P46 対策）
- [ ] 型追加するか JSDoc で代替するかを決定した
- [ ] 決定内容を implementation-guide.md または関連仕様書に追記した

## 参照

- `apps/desktop/src/renderer/components/` — ChatPanel コンポーネント
- `.claude/rules/06-known-pitfalls.md#P46` — HTMLAttributes Props 型衝突パターン
- `docs/30-workflows/step-05-par-task-07-chatpanel-review-harness-alignment/outputs/phase-2/design.md` — 設計書
