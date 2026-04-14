# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 10                                                                      |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 9                                                                 |
| 後続Phase  | Phase 11                                                                |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

QA完了後の成果物を最終的にレビューし、Phase 11（手動テスト・VISUAL）提出前の最後のゲートチェックを行う。
実装内容が要件・設計・レビュー結果と一致していることを確認する。

## 実行タスク

- [ ] 要件定義（Phase 1）との照合
- [ ] 設計（Phase 2）との照合
- [ ] 設計レビュー（Phase 3）の指摘事項が全て反映されているか確認
- [ ] 変更差分の最終確認（意図しない変更がないか）
- [ ] コミットメッセージの準備

## 参照資料

| 資料名       | パス                       | 説明               |
| ------------ | -------------------------- | ------------------ |
| 要件定義     | `phase-1-requirements.md`  | 照合元             |
| 設計書       | `phase-2-design.md`        | 照合元             |
| 設計レビュー | `phase-3-design-review.md` | 指摘事項の反映確認 |

## 実行手順

### Step 1: 要件との照合チェックリスト

| 要件（Phase 1 受け入れ基準）                               | 実装内容                                                   | 照合結果 |
| ---------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| AC-1: カテゴリを複数選択できる（`SkillCategory[]`型）      | `SkillInfoFormData.category: SkillCategory[]`に変更        | 要確認   |
| AC-2: 選択済みカテゴリを再クリックで解除できる             | `handleCategoryClick`トグルロジック実装                    | 要確認   |
| AC-3: 全ウィザードボタンが同一CSS変数スタイルを使用する    | `bg-[var(--status-primary)]`・`text-[var(--text-inverse)]` | 要確認   |
| AC-4: `InterviewProgressBar`が動的に回答済み問数を表示する | `Math.max(1, answeredCount)`で動的計算                     | 要確認   |
| AC-5: カテゴリ型変更に伴う既存テストの更新が完了している   | `skillCreator-wizard.test.ts`更新済み                      | 要確認   |

### Step 2: 設計レビュー（Phase 3）指摘事項の反映確認

| Phase 3 指摘事項                                           | 反映内容                                | 確認   |
| ---------------------------------------------------------- | --------------------------------------- | ------ |
| `category`型変更の後方互換性確認                           | subpathexport範囲内の変更のみ           | 要確認 |
| `handleCategoryClick`境界値（全解除→[]）                   | `next`をそのまま保持して対応            | 要確認 |
| `currentQuestion`のPage 2遷移直後の表示（3/6になる可能性） | 意図した動作として設計に明記済み        | 要確認 |
| `hover:bg-blue-700`の除去                                  | `hover:`クラスを除去し`opacity`等で代替 | 要確認 |
| `bg-blue-600`の全除去確認コマンドの実行                    | Phase 9 QAで確認済み                    | 要確認 |

### Step 3: 変更差分の最終確認

```bash
# 変更差分を確認
git diff packages/shared/src/types/skillCreator.ts
git diff apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
git diff apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git diff apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

確認ポイント:

- `skillCreator.ts`の差分が`category`フィールドのみであること（他の型定義に変更がないこと）
- `SkillInfoStep.tsx`の差分が`handleCategoryClick`・`isSelected`・`isNextEnabled`・ボタンクラスのみであること
- `ConversationRoundStep.tsx`の差分が`currentQuestion`計算部分のみであること
- `SkillCreateWizard.tsx`の差分がボタンクラスのみであること

### Step 4: コミットメッセージ準備

```bash
git commit -m "$(cat <<'EOF'
fix(skill-wizard): TASK-SW-FIX-UI-001 UI整合性修正

- カテゴリ複数選択対応: SkillInfoFormData.category を SkillCategory[] に変更
- カテゴリ解除: handleCategoryClick をトグル動作に修正（問題15）
- ProgressBar動的化: currentQuestion を回答済み問数から動的計算（問題11・16）
- ボタンスタイル統一: bg-blue-600 を CSS変数 --status-primary に統一（問題3）

対象ファイル:
- packages/shared/src/types/skillCreator.ts
- apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
EOF
)"
```

### Step 5: 最終品質確認

```bash
pnpm --filter @repo/shared typecheck && \
pnpm --filter @repo/desktop typecheck && \
pnpm --filter @repo/shared lint && \
pnpm --filter @repo/desktop lint && \
pnpm --filter @repo/shared test && \
pnpm --filter @repo/desktop test
```

全コマンドが成功することを確認する。

## 成果物

- 最終レビュー済みの関連修正ファイル（7ファイル）
- 準備済みコミットメッセージ

## 完了条件

- [ ] AC-1〜AC-5が全て実装されていることを照合済み
- [ ] Phase 3 の設計レビュー指摘事項が全て反映されている
- [ ] 変更差分が意図した範囲のみであることを確認している
- [ ] コミットメッセージが準備されている
- [ ] 全チェック（型チェック・リント・テスト）が最終実行で通過している
