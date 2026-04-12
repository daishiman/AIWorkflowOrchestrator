# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 1                                    |
| 名称       | 要件定義                             |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- 本タスクのスコープ・受入条件・UIタスク分類を固定する
- 変更対象ファイルの現状コードを確認し、重複作業を防止する（P50チェック）
- 既存命名規則（camelCase/kebab-case等）を分析・記録する

---

## Step 0: P50チェック（必須）

Phase 1 開始前に対象ファイルの実装状態を確認し、既実装コードの重複作成を防止する。

```bash
# 直近コミット確認
git log --oneline -5

# CATEGORY_OPTIONS 現状確認
grep -n "CATEGORY_OPTIONS\|icon\|description\|tooltip\|title=" \
  apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx

# テストファイル確認
grep -n "icon\|tooltip\|aria-label\|title" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx

# SkillCategory 型定義確認
grep -n "SkillCategory\|CATEGORY" packages/shared/src/types/skillCreator.ts
```

### 現状確認結果（記録欄）

- [ ] `CATEGORY_OPTIONS` にアイコン・descriptionフィールドが**存在しない**ことを確認
- [ ] テストファイルにアイコン・ツールチップのテストが**存在しない**ことを確認
- [ ] `SkillCategory` 型は `packages/shared/src/types/skillCreator.ts` に定義済み

---

## 実行タスク

### Task 1: UIタスク分類の宣言（必須）

**本タスクは UIタスク** である。

| 分類項目     | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスク種別   | UIタスク（Renderer コンポーネント変更）             |
| 変更レイヤー | Renderer（`apps/desktop/src/renderer/`）            |
| Phase 11     | VISUAL（スクリーンショット取得必須）                |
| IPC変更      | なし（純粋UIコンポーネント変更）                    |
| 型定義変更   | `CATEGORY_OPTIONS` の shape変更のみ（既存型の拡張） |

### Task 2: 受入条件（Acceptance Criteria）の定義

| ID   | 受入条件                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------- |
| AC-1 | `CATEGORY_OPTIONS` の各エントリに `icon: string` フィールドが追加されている                           |
| AC-2 | `CATEGORY_OPTIONS` の各エントリに `description: string` フィールドが追加されている                    |
| AC-3 | 各カテゴリボタンにアイコンが表示される（絵文字またはSVGアイコン）                                     |
| AC-4 | 各カテゴリボタンにホバー時のツールチップが表示される（`title` 属性またはカスタムUI）                  |
| AC-5 | 各カテゴリボタンに `aria-label` 属性が追加され、表示ラベルをそのまま accessible name として明示できる |
| AC-6 | 既存の選択状態（`aria-pressed`）・クリック動作は維持される                                            |
| AC-7 | `SkillInfoStep.test.tsx` にアイコン・ツールチップ・A11yのテストが追加されている                       |
| AC-8 | `pnpm typecheck` / `pnpm lint` / `pnpm test` が全て PASS する                                         |

### Task 3: スコープ定義

#### スコープ内

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` の変更
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` の更新
- `CATEGORY_OPTIONS` 配列の shape 拡張（`icon`, `description` フィールド追加）
- ボタン UI へのアイコン表示実装
- ホバー時ツールチップ実装（`title` 属性ベース）
- `aria-label` 属性追加

#### スコープ外

- `SkillCategory` 型定義自体の変更（`packages/shared/src/types/skillCreator.ts`）
- 新規 IPC チャンネルの追加
- アイコンライブラリの新規導入（既存利用のものを使用、なければ絵文字）
- カスタムツールチップコンポーネントの新規作成（スコープ外）
- `UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001` との同時実施

### Task 4: 命名規則の記録

既存コードから確認した命名規則：

| 項目                   | 現状の規則                        | 例                         |
| ---------------------- | --------------------------------- | -------------------------- |
| 配列定数               | UPPER_SNAKE_CASE                  | `CATEGORY_OPTIONS`         |
| オブジェクトフィールド | camelCase                         | `value`, `label`           |
| コンポーネント関数     | PascalCase                        | `SkillInfoStep`            |
| Props インターフェース | PascalCase + `Props` suffix       | `SkillInfoStepProps`       |
| イベントハンドラ       | `handle` + PascalCase             | `handleCategoryClick`      |
| CSS クラス             | Tailwind utility                  | `rounded-full border px-3` |
| テスト ID              | kebab-case（`data-testid`未使用） | -                          |

### Task 5: inventory（対象ファイル一覧）

| ファイル                                                                             | 操作 | 理由                                   |
| ------------------------------------------------------------------------------------ | ---- | -------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | 修正 | CATEGORY_OPTIONS拡張・UI実装           |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | 修正 | アイコン・ツールチップ・A11yテスト追加 |

**新規作成ファイルなし**（既存ファイルの修正のみ）

---

## 参照資料

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` - 変更対象
- `packages/shared/src/types/skillCreator.ts` - SkillCategory 型
- `.claude/skills/task-specification-creator/references/phase-template-core.md`
- GitHub Issue #2028

---

## 統合テスト連携

UIコンポーネント変更の影響範囲：

- `SkillInfoStep` は `SkillCreateWizard` から呼び出される
- `formData.category` の状態管理は親コンポーネントが保持（本タスクで変更なし）
- Props interface（`SkillInfoStepProps`）の変更なし（内部定数のみ変更）

---

## 多角的チェック観点

| 観点             | 確認内容                                                           |
| ---------------- | ------------------------------------------------------------------ |
| アクセシビリティ | `aria-label` 追加でスクリーンリーダー対応が向上するか              |
| 視覚的一貫性     | アイコンスタイルが既存UIと調和するか                               |
| パフォーマンス   | 絵文字アイコン使用時のレンダリングコストは許容範囲か               |
| 後方互換性       | `CATEGORY_OPTIONS` shape変更がテスト以外の箇所に影響しないか       |
| 並列PR分離       | `UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001` との競合を避けているか |

---

## 成果物

| 成果物                           | 配置先                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-1-requirements.md`                |
| spec-extraction-map              | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-1/spec-extraction-map.md` |

---

## 完了条件

- [ ] P50チェック完了（既存実装状態を確認）
- [ ] UIタスク分類を明示的に宣言（UIタスク / VISUAL）
- [ ] AC-1〜AC-8 が定義されている
- [ ] スコープ内・外が明確に区別されている
- [ ] 命名規則が記録されている
- [ ] inventory（対象ファイル一覧）が確定している

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: UIタスク分類宣言
- [ ] Task 2 完了: 受入条件（AC-1〜AC-8）定義
- [ ] Task 3 完了: スコープ定義
- [ ] Task 4 完了: 命名規則記録
- [ ] Task 5 完了: inventory確定

---

## 次Phase

Phase 1 完了後 → **Phase 2: 設計** へ進む

Phase 1-3 完了前に Phase 4 へ進まないこと（ゲート）。
