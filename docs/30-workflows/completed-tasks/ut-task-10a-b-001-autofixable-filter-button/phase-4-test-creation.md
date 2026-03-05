# Phase 4: テスト作成 — 自動修正可能フィルタボタン実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 4                  |
| タスクID   | UT-TASK-10A-B-001  |
| 前提Phase  | Phase 3            |
| 後続Phase  | Phase 5 実装       |
| 作成日     | 2026-03-05         |
| ステータス | 完了（2026-03-05） |

## 目的

Red-Green の Red として、auto-fixable 一括選択機能の不具合を再現・検知できるテスト群を先に固定する。

## Atent Team（SubAgent）分担

| SubAgent | 担当                                                      |
| -------- | --------------------------------------------------------- |
| A        | `SuggestionList` 単体テストケース                         |
| B        | `useSkillAnalysis` / `SkillAnalysisView` 連携テストケース |
| C        | テストデータファクトリと回帰観点の統合                    |

## 実行タスク

- 単体テスト作成: `SuggestionList` の一括選択導線を Red ケースで固定する
- 連携テスト作成: `SkillAnalysisView` 経由の状態更新と適用導線を Red ケースで固定する
- 境界ケース設計: 0件・全false・再選択ケースの期待値を固定する

### Task 4-1: 単体テストケース作成

対象: `src/renderer/components/skill/__tests__/SuggestionList.test.tsx`

- ボタンが表示される
- クリックで auto-fixable のみ選択される
- auto-fixable 0件時は操作不可
- a11y属性が維持される

### Task 4-2: 連携テストケース作成

対象: `src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`

- 一括選択後に「適用」導線へ到達できる
- 既存個別選択との共存
- 既存エラー表示/ローディング表示への非干渉

### Task 4-3: 境界ケース設計

- 提案0件
- 全件 false
- true/false 混在
- 選択済み状態からの再実行

## 並列実行計画

| タスク                     | 実行パターン | 理由                                  |
| -------------------------- | ------------ | ------------------------------------- |
| Task 4-1(A) と Task 4-2(B) | 並列         | 対象ファイルと責務が分離              |
| Task 4-3(C)                | 直列         | A/B結果を統合して境界ケース重複を除去 |

## 参照資料

依存Phase成果物: Phase 1, Phase 2, Phase 3

| 資料名         | パス                                                                                  | 用途             |
| -------------- | ------------------------------------------------------------------------------------- | ---------------- |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`     | RTL/Vitest構成   |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`           | テスト網羅基準   |
| 親タスクテスト | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-4/test-cases.md` | 既存観点との整合 |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に実施し、成果物へ記録する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                         | 参照仕様                      |
| -------------------- | -------------------------------- | ----------------------------- |
| セキュリティ         | 入力検証・境界防御が必要かを確認 | `security-*.md`               |
| UI/UX                | 操作導線・a11y要件の充足を確認   | `ui-ux-*.md`                  |
| アーキテクチャ       | 責務分離と依存方向を確認         | `architecture-*.md`           |
| API/インターフェース | 既存契約とのドリフト有無を確認   | `api-*.md`, `interfaces-*.md` |
| エラーハンドリング   | 失敗時の通知と分類を確認         | `error-handling.md`           |

## 統合テスト連携（Phase 1〜11）

- UIイベント -> hook更新 -> 適用導線の3段を1シナリオとして追跡できるテストIDを付与する。

## 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| テスト仕様       | `outputs/phase-4/test-specification.md`   |
| テストケース一覧 | `outputs/phase-4/test-cases.md`           |
| 境界値マトリクス | `outputs/phase-4/boundary-case-matrix.md` |

## 完了条件

- [x] 正常系/異常系/境界系のケースが定義されている
- [x] Redとして失敗条件が再現可能である
- [x] Phase 5 実装担当が迷わない粒度で手順化されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物3点を出力済み
- [x] 引き継ぎ事項を記録済み

## 次のPhase

Phase 5: 実装
