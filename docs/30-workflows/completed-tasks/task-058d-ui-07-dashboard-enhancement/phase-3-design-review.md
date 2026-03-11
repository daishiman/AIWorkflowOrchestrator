# Phase 3: 設計レビューゲート

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| Phase        | 3                                     |
| Phase名      | 設計レビューゲート                    |
| 前提Phase    | Phase 1, Phase 2                      |
| 後続Phase    | Phase 4                               |
| ステータス   | completed                             |
| 作成日       | 2026-03-11                            |
| 機能名       | task-058d-ui-07-dashboard-enhancement |
| 担当SubAgent | SubAgent-D                            |

## 目的

ホーム画面の設計が既存ナビ、既存 store、既存 atoms と衝突しないかを判定し、
実装前の手戻り要因を除去する。

## 実行タスク

- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を決める
- リスク抽出: 導線・A11y・共有コンポーネント影響の観点で不整合を洗い出す
- 戻り先定義: 要件戻りか設計戻りかを明確にする

## 参照資料

| 参照資料      | パス                                                                           | 内容         |
| ------------- | ------------------------------------------------------------------------------ | ------------ |
| Phase 1仕様   | `phase-1-requirements.md`                                                      | 要件整合確認 |
| Phase 2仕様   | `phase-2-design.md`                                                            | 設計対象     |
| Phase 2成果物 | `outputs/phase-2/*.md`                                                         | 詳細設計     |
| レビュー基準  | `.agents/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準     |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                           | 内容                       |
| -------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| UI設計原則           | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Tap & Discover 妥当性      |
| 状態管理             | `.agents/skills/aiworkflow-requirements/references/arch-state-management.md`   | selector / navigation 責務 |
| UIコンポーネント台帳 | `.agents/skills/aiworkflow-requirements/references/ui-ux-components.md`        | atoms への波及確認         |
| A11y テスト          | `.agents/skills/aiworkflow-requirements/references/testing-accessibility.md`   | キーボード/role 判定       |

## 実行手順

### ステップ1: 要件-設計の対応を確認する

- FR/AC ごとに設計要素が存在するか確認する
- `dashboard` ID 維持とホーム文言化が両立しているか確認する

### ステップ2: 共有境界をレビューする

- `SuggestionBubble` 既存 API を壊していないか確認する
- ナビ共有ラベル変更が本タスクへ混入していないか確認する
- `historySearch` への責務逸脱がないか確認する

### ステップ3: 判定と戻り先を記録する

- MAJOR 以上は Phase 2 に戻す
- 要件漏れは Phase 1 に戻す

## 統合テスト連携

| 観点 | 内容                                                                     |
| ---- | ------------------------------------------------------------------------ |
| 導線 | CTA と `historySearch` handoff を Phase 4 の interaction test へ引き継ぐ |
| A11y | button role, focus order, time semantics をテストケースへ引き継ぐ        |
| 文言 | 「ホーム」表示と `dashboard` 内部 ID 共存を回帰対象にする                |

## 多角的チェック観点

| 観点               | 適用判断                                             | 仕様参照先                                          |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| UI/UX              | Tap & Discover の妥当性確認で適用                    | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ     | atoms / view-local 境界確認で適用                    | `aiworkflow-requirements: architecture-*.md`        |
| アクセシビリティ   | CTA / timeline の role 確認で適用                    | `aiworkflow-requirements: testing-accessibility.md` |
| セキュリティ       | 新規 IPC / Preload 境界逸脱の有無確認で適用          | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | invalid timestamp / empty state の扱い確認で適用     | `aiworkflow-requirements: error-handling.md`        |
| テスタビリティ     | helper / selector / navigation mock の分離確認で適用 | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物           | パス                                      | 内容                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | ゲート判定             |
| レビュー指摘一覧 | `outputs/phase-3/review-findings.md`      | 指摘、戻り先、保留事項 |

## 完了条件

- [x] PASS / MINOR / MAJOR / CRITICAL の判定が記録されている
- [x] atoms 影響とナビ境界がレビューされている
- [x] `historySearch` 責務逸脱がないと確認されている
- [x] 戻り先が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 要件-設計対応の確認
3. 共有境界レビュー
4. Gate 判定
5. 戻り先整理

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] review result と findings の2成果物が定義されている
- [x] Phase 4 への引き継ぎ観点が明記されている
- [x] `artifacts.json` の Phase 3 記述と整合している

## 次のPhase

Phase 4: テスト作成
