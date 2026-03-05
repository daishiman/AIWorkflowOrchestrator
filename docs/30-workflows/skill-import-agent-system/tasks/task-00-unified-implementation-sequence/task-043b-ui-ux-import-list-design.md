---
id: TASK-10A-E-B
tier: 3
title: TASK-10A-E UI/UX インポート一覧設計
depends_on: [TASK-10A-E]
parallel_with: [TASK-10A-E-A, TASK-10A-E-C]
blocks: [TASK-10A-E-D]
status: pending
priority: high
estimated_complexity: small
tags: [docs, ui, ux, accessibility]
---

# TASK-10A-E-B UI/UX インポート一覧設計

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| 担当       | SubAgent-B                                       |
| 対象       | `SkillManagementPanel` の list/import UI         |
| 実行モード | 仕様策定のみ（実装・コミット・PRなし）           |
| 方針       | 「インポート済み」「利用可能」を同一画面で見せる |

## 目的

ユーザーが管理パネル内で import 可能スキルを迷わず発見し、空状態・エラー状態・検索状態を含めて一貫した操作体験を得られる UI 仕様を定義する。

## 実行タスク

- 表示設計: imported / available の2セクション構成を定義
- 状態設計: loading / empty / no-result / error の文言と表示条件を定義
- 操作設計: importボタンの disabled 条件、連打防止、完了後遷移を定義
- A11y設計: キーボード操作、aria属性、フォーカス順を定義

## 参照資料（aiworkflow-requirements）

| 参照資料             | パス                                                                            | 使用目的                                    |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| resource-map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | UI実装/コンポーネントテストの参照範囲を特定 |
| quick-reference      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`             | UI状態表示とテスト基準の先行パターンを固定  |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | empty/loading/error のUI基準                |
| UIデザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      | spacing/typography/color の一貫性を固定     |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | 文言・アクセシビリティ基準                  |
| 機能UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 検索・フィルタ・一覧更新の整合              |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | UI回帰防止の品質ゲート                      |

## aiworkflow抽出トレーサビリティ

| 抽出ステップ | 根拠                         | 結果                                     |
| ------------ | ---------------------------- | ---------------------------------------- |
| タスク分類   | `indexes/resource-map.md`    | UI実装 + コンポーネントテストとして分類  |
| パターン固定 | `indexes/quick-reference.md` | UI状態表示とa11y観点を先行固定           |
| 正本抽出     | `ui-ux-components.md` ほか   | セクション構成・状態表示・a11y要件を確定 |

## 実行手順

1. セクション構成を「インポート済み」「利用可能」の順で定義する。
2. 検索条件が両セクションへ同一適用される仕様を明記する。
3. empty/no-result/error のメッセージと優先表示順を決定する。
4. キーボード遷移（Tab, Enter, Escape）とフォーカス復帰ルールを確定する。
5. D へ UI テスト観点（見出し、件数、状態表示、A11y属性）を引き渡す。

## 成果物

| 成果物      | パス                                    | 説明                       |
| ----------- | --------------------------------------- | -------------------------- |
| UI/UX仕様書 | `task-043b-ui-ux-import-list-design.md` | import UI と状態表示の定義 |

## 完了条件

- [ ] 2セクション表示仕様が定義されている
- [ ] 検索・空状態・エラー状態の表示条件が定義されている
- [ ] A11y要件（キーボード/aria/フォーカス）が定義されている
- [ ] SubAgent-D へテスト観点を引き渡している
