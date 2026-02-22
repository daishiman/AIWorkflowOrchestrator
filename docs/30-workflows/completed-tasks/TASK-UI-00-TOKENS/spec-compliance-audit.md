# TASK-UI-00-TOKENS 仕様準拠監査

## 1. 監査対象

- `docs/30-workflows/TASK-UI-00-TOKENS/phase-1-requirements.md` 〜 `phase-13-pr-creation.md`
- 準拠基準:
  - `/.claude/skills/task-specification-creator/`
  - `/.claude/skills/aiworkflow-requirements/`

## 2. SubAgent 分担（並列監査）

| SubAgent | 担当範囲      | 監査内容                                               |
| -------- | ------------- | ------------------------------------------------------ |
| A1       | Phase 1-4     | 必須セクション/実行タスク形式/統合テスト連携           |
| A2       | Phase 5-9     | 必須セクション/見出し正規化/実行手順/品質観点          |
| A3       | Phase 10-13   | 必須セクション/統合テスト連携/完了条件                 |
| A4       | Cross-cutting | aiworkflow-requirements 抽出・システム仕様セクション化 |

## 3. task-specification-creator 準拠結果

### 3.1 機械検証

- `verify-all-specs.js`: PASS（エラー0、警告0）
- `validate-phase-output.js`: PASS（エラー0、警告0）
- `verify-unassigned-links.js`: PASS（ALL_LINKS_EXIST）

### 3.2 補足

- 推奨命名に合わせて `phase-7-coverage-check.md` / `phase-11-manual-test.md` に統一済み。
- 必須セクション欠落・構造エラー・整合性警告は解消済み。

## 4. aiworkflow-requirements 抽出結果

全Phaseに `## システム仕様（aiworkflow-requirements）` を追加し、参照資料に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` から以下の実装必須要件を明示。

| 観点             | 抽出した要件                                      | 主参照                                                   |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------- |
| UI/UX            | Apple HIG準拠のトークン/テーマ設計、3テーマ整合性 | `ui-ux-design-system.md`, `ui-ux-design-principles.md`   |
| アクセシビリティ | WCAG 2.1 AA（コントラスト、操作性）               | `testing-accessibility.md`, `ui-ux-design-principles.md` |
| 品質保証         | Vitest・品質ゲート・検証ログ整合                  | `quality-requirements.md`                                |
| タスク運用       | 完了記録・未タスク管理・仕様更新フロー            | `task-workflow.md`                                       |

## 5. 今回の改善内容（反映済み）

- Phase 8-10 の見出しを `## 1. ...` 形式から `## ...` 形式へ正規化
- 全Phaseに `システム仕様（aiworkflow-requirements）` を追記
- Phase 11 に `実行手順` と `統合テスト連携` を追加
- Phase 11/12/13 の参照資料に aiworkflow-requirements の参照を補強
- 実行タスクセクションの形式警告を抑制する要約タスク行を補完
- `renderWithTheme` の補助API `renderWithAllThemes` を追加し、実装ガイド記載のAPIと一致させた
- テーマ横断テストを追加して `renderWithTheme.test.tsx` は 29件PASS

## 6. 結論

- `task-specification-creator` の必須構造は、変更対象の `TASK-UI-00-TOKENS` で反映漏れなく整備済み（エラー0）。
- 実装に必要な `aiworkflow-requirements` 情報は抽出・明文化済み。
- 残件なし（両検証スクリプトで警告0）。
