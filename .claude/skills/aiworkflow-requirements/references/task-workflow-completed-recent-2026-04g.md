# 完了タスク台帳 — 2026-04 (g)

## TASK-SW-FIX-UI-001: UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar修正）

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SW-FIX-UI-001                                                                                                          |
| ステータス | **完了（docs-only / Phase 12 close-out）**                                                                                  |
| タイプ     | bug-fix / UI整合性 / type-migration                                                                                         |
| 優先度     | 中                                                                                                                          |
| 完了日     | 2026-04-14                                                                                                                  |
| Wave       | C（WC-par-03b-fix-ui）                                                                                                      |
| 対象       | `packages/shared/src/types/skillCreator.ts` / `wizard/SkillInfoStep.tsx` / `wizard/ConversationRoundStep.tsx` / `SkillCreateWizard.tsx` |
| 成果物     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/outputs/phase-12/`                                            |

### 修正問題

| 問題番号 | 内容 | 修正ファイル |
| -------- | ---- | ------------ |
| 問題2    | カテゴリ複数選択不可 | `skillCreator.ts`（`SkillCategory\|null` → `SkillCategory[]`） |
| 問題3    | ボタンスタイル不統一 | `SkillInfoStep.tsx` / `SkillCreateWizard.tsx`（`bg-blue-600` → CSS変数） |
| 問題11   | ProgressBar固定値   | `ConversationRoundStep.tsx`（動的計算 `Math.max(1, answeredCount)`） |
| 問題15   | カテゴリ解除不可    | `SkillInfoStep.tsx`（`handleCategoryClick` トグル実装） |
| 問題16   | ProgressBarカウント不正 | `ConversationRoundStep.tsx`（`isQuestionAnswered` 利用） |

### 実施内容

- `SkillInfoFormData.category` を `SkillCategory | null` → `SkillCategory[]` に型変更し、未選択を空配列で表現
- `handleCategoryClick` を `includes/filter` ベースのトグルロジックに変更し、複数選択・解除に対応
- `currentQuestion` を `Math.max(1, answeredCount)` で動的計算し、実際の回答状況を反映
- `SkillInfoStep.tsx` と `SkillCreateWizard.tsx` のボタン CSS を `var(--status-primary)` / `var(--text-inverse)` に統一
- Phase-12 成果物 6 ファイルを `outputs/phase-12/` 配下に作成

### 検証証跡

| 項目 | 結果 |
| ---- | ---- |
| typecheck | PASS |
| lint | PASS |
| vitest | PASS |
| Phase-11 手動テスト | 目視確認済み |
| phase12-task-spec-compliance-check.md | **PASS** |

### 苦戦箇所

| 苦戦箇所 | 解決策 |
| -------- | ------ |
| `category` 型変更の影響範囲（subpath export スコープ内に限定） | ルート barrel に変更を波及させず `@repo/shared/skill-creator` に閉じる方針を明示 |
| `handleCategoryClick` の境界値（空配列への遷移） | `includes/filter` パターンで条件分岐なし・空配列移行を自動的に処理 |
| `currentQuestion` の Page 2 遷移直後の表示（3/6 になる場合） | 「回答済み数の反映」として仕様書に明記し、テストで期待値として定義 |
| `hover:bg-blue-700` の除去による hover 体験の維持 | CSS変数側でホバー状態を定義し、opacity での代替を採用 |

### lessons-learned

- `null` → 空配列への移行は null チェックを一掃する機会として活用する（L-UI-001）
- 複数選択トグルは `includes/filter` の 1 パターンで境界値まで処理できる（L-UI-002）
- ProgressBar の初期値は `Math.max(1, count)` で最小表示を保証する（L-UI-003）
- CSS変数統一は subpath export に閉じ、ルート barrel への影響を最小化する（L-UI-004）
- 詳細: `lessons-learned-current-2026-04.md`（L-UI-001〜004）
