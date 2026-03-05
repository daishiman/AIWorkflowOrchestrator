# Phase 2: 設計 — 自動修正可能フィルタボタン実装

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 2                    |
| タスクID   | UT-TASK-10A-B-001    |
| 前提Phase  | Phase 1              |
| 後続Phase  | Phase 3 設計レビュー |
| 作成日     | 2026-03-05           |
| ステータス | 完了（2026-03-05）   |

## 目的

`SuggestionList` UIと `useSkillAnalysis` 状態制御を分離し、責務境界を崩さずに auto-fixable 一括選択を追加できる設計を確定する。

## Atent Team（SubAgent）分担

| SubAgent | 担当                                                |
| -------- | --------------------------------------------------- |
| A        | `SuggestionList` UI仕様（props・イベント・a11y）    |
| B        | `useSkillAnalysis` 選択更新仕様（ヘルパー関数設計） |
| C        | A/B統合、テスト容易性、回帰影響評価                 |

## 実行タスク

### Task 2-1: UIコンポーネント設計

- ボタン仕様: ラベル、配置、disabled 条件、`aria-label`。
- props 拡張: `onSelectAutoFixable`（既存にあれば再活用、なければ追加）。
- 表示ルール: auto-fixable 件数が0件の場合の表示挙動。

### Task 2-2: 状態遷移設計

- `selectedSuggestions` 更新ロジックを純関数化する。
- 期待挙動を明確化する（auto-fixable のみ再構築）。
- 既存の個別選択と競合しない更新順序を定義する。

### Task 2-3: API/型境界チェック

- `Suggestion` 型の `autoFixable` 利用前提を確認する。
- `SkillAnalysisView` から `SuggestionList` へのデータフローを固定する。
- 新規IPC/API変更が不要であることを確認する。

### Task 2-4: テスト設計連携

- Phase 4 へ渡す正常/異常/境界ケースを整理する。
- `SuggestionList.test.tsx` と `SkillAnalysisView.test.tsx` の責務分割を決める。

## 並列実行計画

| タスク                     | 実行パターン | 理由                                   |
| -------------------------- | ------------ | -------------------------------------- |
| Task 2-1(A) と Task 2-2(B) | 並列         | UIと状態ロジックの責務が独立           |
| Task 2-3(C)                | 直列         | A/B成果の整合確認が必要                |
| Task 2-4(C)                | 直列         | 最終設計確定後にテスト観点へ落とし込む |

## 参照資料

依存Phase成果物: Phase 1

| 資料名               | パス                                                                                        | 用途                          |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| UI構造仕様           | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | View/Component責務分離        |
| 状態管理仕様         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Hook/Store設計原則            |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `Suggestion` 型境界の整合確認 |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView の正本構成  |
| 開発指針             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 実装可能な設計粒度            |
| 既存設計成果物       | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-2/component-design.md` | 親タスク設計との整合          |

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

- Phase 4 で UIイベント -> 状態更新 -> 適用導線の統合シナリオをそのまま起票できる設計にする。

## 成果物

| 成果物             | パス                                  |
| ------------------ | ------------------------------------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md` |
| 状態遷移設計       | `outputs/phase-2/state-design.md`     |
| テスト設計連携メモ | `outputs/phase-2/test-readiness.md`   |

## 完了条件

- [x] UI/状態/型境界の責務分離が成立している
- [x] 新規API変更不要の判断が明文化されている
- [x] Phase 3 レビュー観点が列挙されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物3点を出力済み
- [x] 引き継ぎ事項を記録済み

## 次のPhase

Phase 3: 設計レビューゲート
