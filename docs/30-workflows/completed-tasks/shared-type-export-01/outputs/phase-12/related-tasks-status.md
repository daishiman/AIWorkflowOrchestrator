# Phase 12: 関連タスク状態

## 作成日

2026-01-13

## 概要

関連する後続タスク（Part 2, Part 3）の状態を確認する。

---

## タスク関連図

```
SHARED-TYPE-EXPORT-01 (Part 1: 型整理)
    ↓ 完了後
SHARED-TYPE-EXPORT-02 (Part 2: メインindex.ts更新)
    ↓ 完了後
SHARED-TYPE-EXPORT-03 (Part 3: デスクトップアプリ検証)
```

---

## 各タスクの状態

### SHARED-TYPE-EXPORT-01 (本タスク)

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| タスク名 | @repo/shared Community型エクスポート（Part 1: 型整理） |
| 状態     | Phase 12 実行中                                        |
| スコープ | `services/graph/index.ts` の作成                       |
| 成果物   | バレルファイル（27項目エクスポート）                   |

### SHARED-TYPE-EXPORT-02 (Part 2)

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| タスク名 | @repo/shared Community型エクスポート（Part 2: メインindex.ts更新）           |
| 指示書   | `docs/30-workflows/unassigned-task/task-shared-community-types-export-02.md` |
| 状態     | 未着手                                                                       |
| 前提     | Part 1 (SHARED-TYPE-EXPORT-01) の完了                                        |
| スコープ | `packages/shared/src/index.ts` への再エクスポート追加                        |

**必要な作業**:

```typescript
// packages/shared/src/index.ts に追加
export * from "./services/graph";
```

### SHARED-TYPE-EXPORT-03 (Part 3)

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| タスク名 | @repo/shared Community型エクスポート（Part 3: デスクトップアプリ検証）       |
| 指示書   | `docs/30-workflows/unassigned-task/task-shared-community-types-export-03.md` |
| 状態     | 未着手                                                                       |
| 前提     | Part 2 (SHARED-TYPE-EXPORT-02) の完了                                        |
| スコープ | `@repo/desktop` での型インポート検証                                         |

**必要な作業**:

```typescript
// apps/desktop での検証
import type { Community } from "@repo/shared/services/graph";
```

---

## 依存関係

```
                    ┌──────────────────┐
                    │ Part 1 (本タスク) │
                    │ index.ts作成     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Part 2           │
                    │ メインindex更新  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Part 3           │
                    │ デスクトップ検証 │
                    └──────────────────┘
```

---

## 次のアクション

| #   | アクション                                         | 担当 |
| --- | -------------------------------------------------- | ---- |
| 1   | Part 1 (本タスク) のPhase 12完了・Phase 13スキップ | 現在 |
| 2   | Part 2 を開始                                      | 次回 |
| 3   | Part 2 完了後、Part 3 を開始                       | 将来 |

---

## 結論

| 項目              | 状態                      |
| ----------------- | ------------------------- |
| Part 1 (本タスク) | Phase 12 実行中           |
| Part 2            | 未着手（Part 1 完了待ち） |
| Part 3            | 未着手（Part 2 完了待ち） |
| 依存関係          | 順次実行（Part 1→2→3）    |

---

## タスク4完了

✅ 関連タスク状態確認完了
