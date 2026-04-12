# Phase 1: spec-extraction-map

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 1                                    |
| タスクID | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 実行日   | 2026-04-11                           |

---

## P50チェック結果

| 確認項目                                    | 結果                      |
| ------------------------------------------- | ------------------------- |
| `CATEGORY_OPTIONS` にアイコンフィールドなし | ✅ 存在しない（実装必要） |
| `CATEGORY_OPTIONS` に description なし      | ✅ 存在しない（実装必要） |
| テストにアイコン・ツールチップテストなし    | ✅ 存在しない（追加必要） |
| `SkillCategory` 型は shared に定義済み      | ✅ 確認済み               |

## UIタスク分類宣言

**本タスクは UIタスク**（Renderer コンポーネント変更のみ）

- Phase 11: VISUAL（スクリーンショット取得必須）
- IPC変更: なし
- Props変更: なし

## 受入条件（AC-1〜AC-8）

| ID   | 受入条件                                                   | ステータス |
| ---- | ---------------------------------------------------------- | ---------- |
| AC-1 | `CATEGORY_OPTIONS` に `icon: string` フィールド追加        | pending    |
| AC-2 | `CATEGORY_OPTIONS` に `description: string` フィールド追加 | pending    |
| AC-3 | 各カテゴリボタンにアイコン表示（絵文字）                   | pending    |
| AC-4 | ホバー時 `title` 属性でツールチップ表示                    | pending    |
| AC-5 | 各ボタンに `aria-label` 属性追加                           | pending    |
| AC-6 | 既存の `aria-pressed`・クリック動作維持                    | pending    |
| AC-7 | テストにアイコン・ツールチップ・A11y テスト追加            | pending    |
| AC-8 | `pnpm typecheck` / `pnpm lint` / `pnpm test` 全 PASS       | pending    |

## スコープ確定

### スコープ内

- `SkillInfoStep.tsx` の `CATEGORY_OPTIONS` 拡張
- ボタン UI へのアイコン・`aria-label`・`title` 追加
- `SkillInfoStep.test.tsx` の更新

### スコープ外

- `SkillCategory` 型自体の変更
- 新規 IPC チャンネル
- アイコンライブラリ新規導入
- カスタムツールチップコンポーネント作成

## 命名規則

| 項目           | 規則             | 例                    |
| -------------- | ---------------- | --------------------- |
| 配列定数       | UPPER_SNAKE_CASE | `CATEGORY_OPTIONS`    |
| オブジェクト   | camelCase        | `icon`, `description` |
| コンポーネント | PascalCase       | `SkillInfoStep`       |

## Inventory（対象ファイル）

| ファイル                                          | 操作 |
| ------------------------------------------------- | ---- |
| `SkillInfoStep.tsx`（wizard/配下）                | 修正 |
| `SkillInfoStep.test.tsx`（wizard/**tests**/配下） | 修正 |

**新規作成ファイル: なし**
